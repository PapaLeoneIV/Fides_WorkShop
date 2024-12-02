import logger from '../config/logger';
import log  from "../config/logs";
import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import { OrderStatus as status } from "../config/OrderStatus";
import { EXCHANGE } from "../config/rabbit-config";
import IFrontendRequestDTO from "../dtos/IFrontendRequestDTO";
import IServiceResponseDTO from "../dtos/IServiceResponseDTO";
import IOrderResponseDTO from "../dtos/IOrderResponseDTO";
import IBikeRequestDTO from "../dtos/IBikeRequestDTO";
import IHotelRequestDTO from "../dtos/IHotelRequestDTO";
import { publisher } from "../models/RabbitmqPublisher";
import { orderRepository } from "../repository/order-repository";
import { Response } from "express";
import IToFrontendResponseDTO from "../dtos/IToFrontendResponseDTO";
import IOrderEntityDTO from "../dtos/IOrderEntityDTO";

const MAX_RETRIES = 5;
const TIMEOUT = 10000;
let orderConsumed = false;
let orderCancelled = false;

export async function updateExchange(
  bindKey: string,
  response: IServiceResponseDTO | IBikeRequestDTO | IHotelRequestDTO | IOrderResponseDTO
) {
  try {
    await publisher.publishEvent(EXCHANGE, bindKey, response);
    logger.info(log.SERVICE.PROCESSING(`Response ${response.order_id} published successfully`,response));
  } catch (error) {
    logger.error(log.SERVICE.PROCESSING(`Failed publishing response`,error));
    throw error;
  }
}

export async function HTTPprocessConfirmationRequest(order_id: string, res: Response) {
  let response: IToFrontendResponseDTO = { order_status: status.APPROVED, message: "Order is completed", token: null };
  let order: (IFrontendRequestDTO & { id: string }) | null;

  try {
    logger.info(log.CONTROLLER.VALIDATING("Confirmation Request",{ order_id }));
    order = await orderRepository.read.getOrder(order_id);
    if (!order) throw new Error(`Order not found`);
    console.log(order);
    switch (true) {
      case order.bike_status === status.CANCELLED ||
        order.hotel_status === status.CANCELLED ||
        order.payment_status === status.CANCELLED:
        response.order_status = status.CANCELLED;
        response.message = "Order is cancelled";
        logger.info(log.CONTROLLER.PROCESSING("Response sent to frontend", response ))

        res.status(409).json(response);
        break;
      case order.bike_status === status.APPROVED &&
        order.hotel_status === status.APPROVED &&
        order.payment_status === status.APPROVED:
        logger.info(log.CONTROLLER.PROCESSING("Response sent to frontend",response ))

        res.status(200).json(response);
        break;
      case order.bike_status === status.PENDING ||
        order.hotel_status === status.PENDING ||
        order.payment_status === status.PENDING:
        response.order_status = status.PENDING;
        response.message = "Order is pending";
        logger.info(log.CONTROLLER.PROCESSING("Response sent to frontend",response ))

        res.status(202).json(response); //TODO: check if this is the correct status code
        break;
      default:
        response.order_status = status.DENIED;
        response.message = "Order is denied";
        res.status(403).json(response);
    logger.info(log.CONTROLLER.PROCESSING("Response sent to frontend",response ))

        break;
    }
    logger.info(log.CONTROLLER.PROCESSING("Response sent to frontend",response ))
  } catch (error) {
    logger.error(log.SERVICE.PROCESSING(`Failed to process confirmation request: ${error}`,{ order_id }));
    response.order_status = status.ERROR;
    response.message = error as string;
    res.status(500).json(response);
  }
}

export async function HTTPprocessFrontendRequest(req: IFrontendRequestDTO, res: Response) {
    let response: IToFrontendResponseDTO = { order_status: status.APPROVED, message: "Order is completed", token: null } ;
    let  order: IOrderEntityDTO | null;

    try{
        logger.info(log.CONTROLLER.VALIDATING("Frontend Request",{ req }));

        const authResponse = await fetch("http://authentication-service:3000/auth/validateJWT", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jwtToken: req.userJWT, email: req.userEmail }),
        });
        if (!authResponse.ok)
        {
          response.order_status = status.DENIED; 
          response.message = "Authentication failed, invalid JWT token";
          res.status(401).json(response);
          return;
        }

        order = await orderRepository.write.createOrder(req);
        if (!order) {
          response.order_status = status.DENIED; 
          response.message = "Failed to create order";
          res.status(500).json(response);
          return;
        }
        
        await updateExchange(publisher.bindKeys.ConsumeBikeOrder, {
            order_id: order.id,
            userEmail: order.userEmail,
            road_bike_requested: order.road_bike_requested,
            dirt_bike_requested: order.dirt_bike_requested,
            renting_status: order.bike_status,
            created_at: order.created_at,
            updated_at: order.updated_at,
        });

        await updateExchange(publisher.bindKeys.ConsumeHotelOrder, {
            order_id: order.id,
            userEmail: order.userEmail,
            from: order.from,
            to: order.to,
            room: order.room,
            renting_status: order.hotel_status,
            created_at: order.created_at,
            updated_at: order.updated_at,
        });
        response.order_status = status.APPROVED;
        response.message = "Order is taken in consideration";
        response.order_id = order.id;
        res.status(200).json(response);

    } catch (error) {
        logger.error(log.CONTROLLER.PROCESSING("Frontend Request: {error}",{ error }));
        response.order_status = status.ERROR;
        response.message = error as string;
        //TODO: handle better the status code
        res.status(401).json(response);
    }
}

export async function processFrontendRequest(frontendReq: IFrontendRequestDTO, userJWT: string) {
  let CONSUME_BIKE_BK = publisher.bindKeys.ConsumeBikeOrder;
  let CONSUME_HOTEL_BK = publisher.bindKeys.ConsumeHotelOrder;
   let order: IOrderEntityDTO | null;
  try {
    logger.info(log.SERVICE.PROCESSING("Frontend Request",{ frontendReq }));

    //TODO: handle the url in a better way (maybe use a config file)
    const response = await fetch("http://authentication-service:3000/auth/validateJWT", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: userJWT, email: frontendReq.userEmail }),
    });
    if (!response.ok) {
      logger.error(log.SERVICE.PROCESSING("Failed to validate JWT",{ frontendReq }));
      throw new Error("Authentication failed, invalid JWT token");
    }

    const userInfo: { email: string; id: number; password: string } = await response.json();
    logger.info(log.SERVICE.VALIDATING(`JWT token verified for ${userInfo.email}`,{ userInfo }));

    order = await orderRepository.write.createOrder(frontendReq);
    if (!order) throw new Error("Failed to create order");

    //TODO add user info to bike service
    await updateExchange(CONSUME_BIKE_BK, {
      order_id: order.id,
      userEmail: order.userEmail,
      road_bike_requested: order.road_bike_requested,
      dirt_bike_requested: order.dirt_bike_requested,
      renting_status: order.bike_status,
      created_at: order.created_at,
      updated_at: order.updated_at,
    });

    //TODO add user info to hotel service
    await updateExchange(CONSUME_HOTEL_BK, {
      order_id: order.id,
      userEmail: order.userEmail,
      from: order.from,
      to: order.to,
      room: order.room,
      renting_status: order.hotel_status,
      created_at: order.created_at,
      updated_at: order.updated_at,
    });
  } catch (error) {
    logger.error(log.SERVICE.PROCESSING("Frontend Request",{ error }));
    throw error;
  }
}

export async function processPaymentRequest(order_id: string, retries = 0) {
  let CONSUME_BIKE_SAGA_BK = publisher.bindKeys.ConsumeBikeSAGAOrder;
  let CONSUME_HOTEL_SAGA_BK = publisher.bindKeys.ConsumeHotelSAGAOrder;
  let CONSUME_PAYMENT_BK = publisher.bindKeys.ConsumePaymentOrder;

  let order: (IFrontendRequestDTO & { id: string }) | null;
  let serviceResponse: IServiceResponseDTO = { order_id: order_id, status: status.DENIED };
  let frontendResponse: IOrderResponseDTO = { order_id: order_id, amount: null, created_at: null, updated_at: null };

  try {
    order = await orderRepository.read.getOrder(order_id);
    if (order === null) throw new Error(`Order not found`);

    if (await orderRepository.read.isPending(order)) {
      logger.info(log.SERVICE.PROCESSING("Order is pending, retrying",{ order }));
      if (retries < MAX_RETRIES) {
        setTimeout(() => {
          processPaymentRequest(order_id, retries + 1);
        }, TIMEOUT);
      } else {
        logger.info(log.SERVICE.PROCESSING("Payment request timed out",{ order }));
        await updateExchange(CONSUME_BIKE_SAGA_BK, serviceResponse);
        await updateExchange(CONSUME_HOTEL_SAGA_BK, serviceResponse);
      }
      return;
    }
    frontendResponse = {
      order_id: order.id,
      amount: order.amount,
      created_at: order.created_at,
      updated_at: order.updated_at,
    };

    if (await orderRepository.read.needsCancellation(order)) {
      await orderRepository.write.updatePaymentStatus(order_id, status.CANCELLED);
      logger.info(log.SERVICE.PROCESSING("Both services failed, order cancelled",{ order }));
      return;
    }

    if (await orderRepository.read.isApproved(order)) {
      if(orderConsumed) return;
      logger.info(log.SERVICE.PROCESSING("Order approved, sending response to frontend",{ order }));
      orderConsumed = true;
    }

    if (await orderRepository.read.isCompleted(order)) {
      if(orderConsumed) return;
      logger.info(log.SERVICE.PROCESSING("Order completed, waiting for payment response",{ order }));
      orderConsumed = true;
      publisher.publishEvent(EXCHANGE, CONSUME_PAYMENT_BK, frontendResponse);
    }

    if (await orderRepository.read.isCancelled(order)) {
      if(orderCancelled) return;
      logger.info(log.SERVICE.PROCESSING("Order cancelled, sending response to frontend",{ order }));
      orderCancelled = true;
      return;
    }
  } catch (error) {
    logger.error(
      log.SERVICE.PROCESSING(`Error processing payment for order ${order_id}: ${error}`,{ error })
    );
    throw error;
  }
}
