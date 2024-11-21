import { Messages as log } from "../config/Messages";
import IOrderRequestDTO from "../dtos/IOrderRequestDTO";
import IOrderResponseDTO from "../dtos/IOrderResponseDTO";
import { OrderStatus as status } from "../config/OrderStatus";
import { EXCHANGE } from "../config/rabbit-config";
import { publisher } from "../models/RabbitmqPublisher";
import { orderRepository } from "../repository/order-repository";
import { hotelRepository } from "../repository/hotel-repository";

export async function updateExchange(
  response: IOrderResponseDTO,
  bindKey: string = publisher.bindKeys.PublishHotelOrder
) {
  try {
    await publisher.publishEvent(EXCHANGE, bindKey, response);
    console.log(log.SERVICE.INFO.PROCESSING(`Response ${response.order_id} published successfully`, "", response));
  } catch (error) {
    console.error(log.SERVICE.ERROR.PROCESSING(`Failed publishing response`, "", error));
    throw error;
  }
}

export async function processOrderRequest(request: IOrderRequestDTO) {
  let response: IOrderResponseDTO = { order_id: request.order_id, status: status.DENIED };
  let order: IOrderRequestDTO & { id: string };

  try {
    if (await orderRepository.read.checkExistance(request.order_id)) {
      throw new Error(`Order with id: ${request.order_id} already exists`);
    }

    // if the order does not exist, create the order
    order = await orderRepository.write.createOrder(request);
    console.log(
      log.SERVICE.INFO.PROCESSING(`Order with order_id: ${order.order_id} created with id ${order.id}`, "", order)
    );

    //  check if the room is available for the requested dates
    const n_bookedDays = await hotelRepository.read.getBookedDays(order);
    if (!n_bookedDays) {
      response.status = (await orderRepository.write.updateOrderStatus(order.id, status.DENIED)).renting_status;
      throw new Error(`No dates found for the requested range`);
    }

    // check if the room is available for the entire date range
    if (!(await hotelRepository.read.areRoomsAvailable(n_bookedDays, order.room))) {
      response.status = (await orderRepository.write.updateOrderStatus(order.id, status.DENIED)).renting_status;
      throw new Error(`Room not available for the requested range`);
    }

    // Update the room availability and approve the order
    await hotelRepository.write.updateRoomAvailability(n_bookedDays, order.room);
    response.status = (await orderRepository.write.updateOrderStatus(order.id, status.APPROVED)).renting_status;
    await updateExchange(response);
    console.log(log.SERVICE.INFO.PROCESSING(`Order with id: ${request.order_id} approved`, "", request));
  } catch (error) {
    console.error(
      log.SERVICE.ERROR.PROCESSING(
        `Error while processing order with order_id ${request.order_id} request: ${error}`,
        "",
        error
      )
    );
    await updateExchange(response);
    throw error;
  }
}

export async function processCancellatioRequest(request: IOrderResponseDTO) {
  let response: IOrderResponseDTO = { order_id: request.order_id, status: status.DENIED };

  try {
    // Check if the order exists
    if (!(await orderRepository.read.checkExistance(request.order_id as string)))
      throw new Error(`Order with id: ${request} does not exist`);

    // Check if the order is approved
    let order = await orderRepository.read.getOrderInfo(request.order_id as string);
		if (!order)
			throw new Error(`Order with id: ${request} not found`);
		
    if (order.renting_status !== status.APPROVED) 
      throw new Error(`Order with id: ${request} is not approved cannot be cancelled`);
    

    //TODO: understand if those checks are necessary
    // const n_bookedDays = await hotelRepository.read.getBookedDays(order)!;
    // if (!n_bookedDays) {
    // 	response.status = (await orderRepository.write.updateOrderStatus(order, status.DENIED)).renting_status;
    // 	throw new Error(`No dates found for the requested range`);
    // }

    // if (!await hotelRepository.write.restoreRoomAvailability(n_bookedDays, order.room)) {
    // 	response.status = (await orderRepository.write.updateOrderStatus(order, status.DENIED)).renting_status;
    // 	throw new Error(`Room availability not restored, updating order status to cancelled`);
    // }

    response.status = (await orderRepository.write.updateOrderStatus(order.id, status.CANCELLED)).renting_status;
    console.log(log.SERVICE.INFO.PROCESSING(`Order with id: ${request} successfully cancelled`, "", { request }));
    await updateExchange(response);
    return;
  } catch (error) {
    console.error(log.SERVICE.ERROR.PROCESSING(`Error while processing order with id: ${request}`, "", error));
    await updateExchange(response);
    throw error;
  }
}
