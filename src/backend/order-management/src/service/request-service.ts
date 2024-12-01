import { Messages as log } from "../config/Messages";
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

export async function updateExchange(
  bindKey: string,
  response: IServiceResponseDTO | IBikeRequestDTO | IHotelRequestDTO | IOrderResponseDTO
) {
  try {
    await publisher.publishEvent(EXCHANGE, bindKey, response);
    console.log(log.SERVICE.INFO.PROCESSING(`Response ${response.order_id} published successfully`, "", response));
  } catch (error) {
    console.error(log.SERVICE.ERROR.PROCESSING(`Failed publishing response`, "", error));
    throw error;
  }
}

export async function HTTPprocessConfirmationRequest(order_id: string, res: Response) {
  let response: IToFrontendResponseDTO = { status: status.APPROVED, message: "Order is completed", token: null };
  let order: (IFrontendRequestDTO & { id: string }) | null;

  try {
    order = await orderRepository.read.getOrder(order_id);
    if (!order) throw new Error(`Order not found`);

    switch (true) {
      case order.bike_status === status.CANCELLED ||
        order.hotel_status === status.CANCELLED ||
        order.payment_status === status.CANCELLED:
        response.status = status.CANCELLED;
        response.message = "Order is cancelled";
        res.status(409).json(response);
        break;
      case order.bike_status === status.APPROVED &&
        order.hotel_status === status.APPROVED &&
        order.payment_status === status.APPROVED:
        res.status(200).json(response);
        break;
      case order.bike_status === status.PENDING ||
        order.hotel_status === status.PENDING ||
        order.payment_status === status.PENDING:
        response.status = status.PENDING;
        response.message = "Order is pending";
        res.status(202).json(response); //TODO: check if this is the correct status code
        break;
      default:
        response.status = status.DENIED;
        response.message = "Order is denied";
        res.status(403).json(response);
    }
  } catch (error) {
    console.error(log.SERVICE.ERROR.PROCESSING(`Failed to process confirmation request: ${error}`, "", { order_id }));
    response.status = status.ERROR;
    response.message = error as string;
    res.status(500).json(response);
  }
}

export async function HTTPprocessFrontendRequest(req: IFrontendRequestDTO, res: Response) {
    let response: IToFrontendResponseDTO = { status: status.APPROVED, message: "Order is completed", token: null };
    let  order: IOrderEntityDTO | null;

    try{
        console.log(log.CONTROLLER.INFO.VALIDATING("Frontend Request", "", { req }));

        const response = await fetch("http://authentication-service:3000/auth/validateJWT", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jwtToken: req.userJWT, email: req.userEmail }),
        });
        if (!response.ok) throw new Error("Authentication failed, invalid JWT token");

        order = await orderRepository.write.createOrder(req);
        
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

        res.status(200).json(response);
    } catch (error) {
        console.error(log.CONTROLLER.ERROR.PROCESSING("Frontend Request: {error}", "", { error }));
        response.status = status.ERROR;
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
    console.log(log.SERVICE.INFO.PROCESSING("Frontend Request", "", { frontendReq }));

    //TODO: handle the url in a better way (maybe use a config file)
    const response = await fetch("http://authentication-service:3000/auth/validateJWT", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: userJWT, email: frontendReq.userEmail }),
    });
    if (!response.ok) {
      console.error(log.SERVICE.ERROR.PROCESSING("Failed to validate JWT", "", { frontendReq }));
      throw new Error("Authentication failed, invalid JWT token");
    }

    const userInfo: { email: string; id: number; password: string } = await response.json();
    console.log(log.SERVICE.INFO.VALIDATING(`JWT token verified for ${userInfo.email}`, "", { userInfo }));

    order = await orderRepository.write.createOrder(frontendReq);

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
    console.error(log.SERVICE.ERROR.PROCESSING("Frontend Request", "", { error }));
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
      if (retries < MAX_RETRIES) {
        setTimeout(() => {
          processPaymentRequest(order_id, retries + 1);
        }, TIMEOUT);
      } else {
        console.log(log.SERVICE.WARNING.PROCESSING("Payment request timed out", "", { order }));
        await updateExchange(CONSUME_BIKE_SAGA_BK, serviceResponse);
        await updateExchange(CONSUME_HOTEL_SAGA_BK, serviceResponse);
      }
      return;
    }

    if (await orderRepository.read.needsCancellation(order)) {
      await orderRepository.write.updatePaymentStatus(order_id, status.CANCELLED);
      console.log(log.SERVICE.WARNING.PROCESSING("Both services failed, order cancelled", "", { order }));
      //TODO: send response to frontend
      return;
    }

    frontendResponse = {
      order_id: order.id,
      amount: order.amount,
      created_at: order.created_at,
      updated_at: order.updated_at,
    };

    if (await orderRepository.read.isCompleted(order)) {
      console.log(log.SERVICE.INFO.PROCESSING("Order completed, sending response to frontend", "", { order }));
      return;
    }

    if (await orderRepository.read.isCancelled(order)) {
      console.log(log.SERVICE.WARNING.PROCESSING("Order cancelled, sending response to frontend", "", { order }));
      return;
    }
  } catch (error) {
    console.error(
      log.SERVICE.ERROR.PROCESSING(`Error processing payment for order ${order_id}: ${error}`, "", { error })
    );
    throw error;
  }
}
