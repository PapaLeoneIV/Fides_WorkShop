import logger from './config/logger';
import log   from '../config/logs';
import { OrderStatus as status } from '../config/OrderStatus';
import { EXCHANGE } from '../config/rabbit-config';
import IFrontendRequestDTO from "../dtos/IFrontendRequestDTO";
import IServiceResponseDTO from "../dtos/IServiceResponseDTO";
import { orderRepository } from "../repository/order-repository";
import { publisher } from "../models/RabbitmqPublisher";
import { processPaymentRequest } from "./request-service";

async function updateExchange(ORDER_BK: string, id: string ) {
    try {
        await publisher.publishEvent(EXCHANGE, ORDER_BK, id);
        console.log(log.SERVICE.INFO.PROCESSING(`For order with id: ${id}`, "", id));
    } catch (error) {
        console.error(log.SERVICE.ERROR.PROCESSING(`For order with id: ${id}`, "", error));
        throw error;
    }
}

async function cancellPayment(order: IFrontendRequestDTO & { id: string; }) {
    if (order.payment_status === status.PENDING) {
        console.log(`[ORDER SERVICE] Cancelling payment order...`);
        await orderRepository.write.updatePaymentStatus(order.id, status.CANCELLED);
    }
}

export async function processBikeResponse(response: IServiceResponseDTO) {
    let CONSUME_SAGA_HOTEL_BK = publisher.bindKeys.ConsumeHotelSAGAOrder;
    let order: IFrontendRequestDTO & { id: string; };

    try {
        if (response.order_id === null || response.status === status.ERROR)
            throw new Error(`Invalid bike response data`);

        // TODO: choose how to share datas with repository layer (object, variables)
        order = await orderRepository.write.updateBikeStatus(response.order_id, response.status!);
    
        if (order.bike_status === status.DENIED) {
            await orderRepository.write.updateBikeStatus(order.id, status.CANCELLED);
            cancellPayment(order);
            updateExchange(CONSUME_SAGA_HOTEL_BK, order.id);
            throw new Error(`Bike order denied for order with id: ${order.id}`);
        }
        console.log(log.SERVICE.INFO.PROCESSING(`Bike service approved order with id: ${order.id}`, "", order));
        processPaymentRequest(order.id);
    } catch (error) {
        console.error(log.SERVICE.ERROR.PROCESSING(`Bike response ${response.order_id}: ${error}`));
        throw error;
    }
}

export async function processHotelResponse(response: IServiceResponseDTO) {
    let CONSUME_SAGA_BIKE_BK = publisher.bindKeys.ConsumeBikeSAGAOrder;
    let order: IFrontendRequestDTO & { id: string; };

    try {
        if (response.order_id === null || response.status === status.ERROR)
            throw new Error(`Invalid hotel response data`);

        order = await orderRepository.write.updateHotelStatus(response.order_id, response.status!);

        if (order.hotel_status === status.DENIED) {
            await orderRepository.write.updateHotelStatus(order.id, status.CANCELLED);
            cancellPayment(order);
            updateExchange(CONSUME_SAGA_BIKE_BK, order.id);
            throw new Error(`Hotel order denied for order with id: ${order.id}`);
        }
        console.log(log.SERVICE.INFO.PROCESSING(`Hotel service approved order with id: ${order.id}`, "", order));
        processPaymentRequest(order.id);
    } catch (error) {
        console.error(log.SERVICE.ERROR.PROCESSING(`Hotel response ${response.order_id}: ${error}`));
        throw error;
    }
}
  
export async function processPaymentResponse(response: IServiceResponseDTO) {
    let CONSUME_SAGA_HOTEL_BK = publisher.bindKeys.ConsumeHotelSAGAOrder;
    let CONSUME_SAGA_BIKE_BK = publisher.bindKeys.ConsumeBikeSAGAOrder;
    let order: IFrontendRequestDTO & { id: string; } | null;
  
    try {
        if (response.order_id === null || response.status === status.ERROR)
            throw new Error(`Invalid payment response data`);

        order = await orderRepository.read.getOrder(response.order_id);
        order = await orderRepository.write.updatePaymentStatus(response.order_id, response.status!);

        if (response.status !== status.APPROVED) {
            updateExchange(CONSUME_SAGA_HOTEL_BK, response.order_id);
            updateExchange(CONSUME_SAGA_BIKE_BK, response.order_id);
        }

        if (await orderRepository.read.isApproved(order))
            console.log(log.SERVICE.INFO.PROCESSING(`Order with id: ${order.id} approved`, "", order));
    } catch (error) {
        console.error(log.SERVICE.ERROR.PROCESSING(`Payment response ${response.order_id}: ${error}`));
        throw error;
    }
}