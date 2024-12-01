import logger from '../config/logger';
import log  from "../config/logs";
import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import IOrderRequestDTO from "../dtos/IOrderRequestDTO";
import IOrderResponseDTO from "../dtos/IOrderResponseDTO";
import { OrderStatus as status } from "../config/OrderStatus";
import { EXCHANGE } from "../config/rabbit-config";
import { publisher } from "../models/RabbitmqPublisher";
import { orderRepository } from "../repository/order-repository";
import { bikeRepository } from "../repository/bike-repository";

// Function to update the exchange with the new message
export async function updateExchange(
  response: IOrderResponseDTO,
  bindKey: string = publisher.bindKeys.PublishBikeOrder
) {
  try {
    await publisher.publishEvent(EXCHANGE, bindKey, response);
    logger.info(log.SERVICE.PROCESSING(`Response ${response.order_id} published successfully`, "", response));
  } catch (error) {
    logger.error(log.SERVICE.PROCESSING(`Failed publishing response`, "", error));
    throw error;
  }
}

// Function to handle the creation of an order
export async function processOrderRequest(request: IOrderRequestDTO) {
  let response: IOrderResponseDTO = { order_id: request.order_id, status: status.DENIED };
  let order: IOrderRequestDTO & { id: string };

  try {
    // Check if the order already exists
    if (await orderRepository.read.checkExistance(request.order_id)) {
      throw new Error(`Order with id: ${request.order_id} already exists`);
    }

    // Create the order
    order = await orderRepository.write.createOrder(request);
    if (!order)
      throw new Error(`Error creating order with order_id: ${request.order_id}`);
    
    logger.info(
      log.SERVICE.PROCESSING(`Order with order_id: ${order.order_id} created with id ${order.id}`, "", order)
    );

    // Check if there are sufficient bikes for the order
    if (!(await bikeRepository.read.checkAvailability(order.road_bike_requested, order.dirt_bike_requested))) {
      response.status = (await orderRepository.write.updateStatus(order.id, status.DENIED)).renting_status;
      throw new Error(`Insufficient bikes for order with id: ${request.order_id}`);
    }

    // Approving the order
    await bikeRepository.write.decrementBikeCount(order.road_bike_requested, order.dirt_bike_requested);
    response.status = (await orderRepository.write.updateStatus(order.id, status.APPROVED)).renting_status;
    logger.info(log.SERVICE.PROCESSING(`Order with id: ${request.order_id} approved`, "", request));
    await updateExchange(response);
  } catch (error) {
    logger.error(
      log.SERVICE.PROCESSING(
        `Error while processing order with order_id ${request.order_id} request: ${error}`,
        "",
        error
      )
    );
    await updateExchange(response);
    throw error;
  }
}

// Function to handle the cancellation of an order
export async function processCancellationRequest(request: IOrderResponseDTO) {
  let SAGA_BK = publisher.bindKeys.PublishbikeSAGAOrder;
  let response: IOrderResponseDTO = { order_id: request.order_id, status: status.DENIED };

  try {
    // Check if the order exists
    if (!(await orderRepository.read.checkExistance(request.order_id as string))) {
      throw new Error(`Order with id: ${request.order_id} does not exist`);
    }

    // Check if the order is approved
    let order = await orderRepository.read.getOrderInfo(request.order_id as string)!;
    if (order && order.renting_status !== status.APPROVED) {
      throw new Error(`Order with id: ${request.order_id} is not approved, cannot cancel`);
    }

    // Cancel the order
    if (order) {
      bikeRepository.write.incrementBikeCount(order.road_bike_requested, order.dirt_bike_requested);
      response.status = (await orderRepository.write.updateStatus(order.id, status.CANCELLED)).renting_status;
      logger.info(log.SERVICE.PROCESSING(`Order with id: ${request.order_id} cancelled`, "", request));
      await updateExchange(response, SAGA_BK);
    }
  } catch (error) {
    logger.error(
      log.SERVICE.PROCESSING(
        `Error while processing cancellation request with order_id ${request.order_id}: ${error}`,
        "",
        error
      )
    );
    await updateExchange(response, SAGA_BK);
    throw error;
  }
}
