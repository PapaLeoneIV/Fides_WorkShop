import { Messages as message } from "../config/log-messages";
import IOrderRequestDTO from "../dtos/IOrderRequestDTO";
import IOrderResponseDTO from "../dtos/IOrderResponseDTO";
import { OrderStatus as status } from "../config/OrderStatus";
import { EXCHANGE } from "../config/rabbit-config";
import { publisher } from "../models/RabbitmqPublisher";
import { orderRepository } from "../repository/order-repository";
import { hotelRepository } from "../repository/hotel-repository";

// publish_to_order_management = async (body: OrderResponseDTO): Promise<void> => {
//     console.log(`[HOTEL SERVICE] Sending to Order Management Service: `, body);
//     this.publishEvent("OrderEventExchange", this.bindKeys.PublishHotelOrder, body);
//   }
// //   publish_to_order_managementSAGA = async (body: OrderResponseDTO): Promise<void> => {
// //     console.log(`[HOTEL SERVICE] Sending to Order Management Service:`, body);
// //     this.publishEvent("OrderEventExchange", this.bindKeys.PublishhotelSAGAOrder, body);
// //   }

// async function updateStatus_and_publishEvent(order: HotelEntity, status: string) {
//   order = await order_manager.update_status(order, status);
//   rabbitPub.publish_to_order_management({ id: order.order_id, status: order.renting_status });
// }

// function to update the exchange with the new message
export async function updateExchange( bindKey: string, msg: IOrderResponseDTO ) {
    try {
        await publisher.publishEvent(EXCHANGE, bindKey, msg);
        console.log(message.SERVICE.INFO.RESPONSE_PUBLISHED(`For order with id: ${msg.id}`, "", msg).message);
    } catch (error) {
        console.error(message.SERVICE.ERROR.ERROR_PUBLISHING_RESPONSE(`For order with id: ${msg.id}`, "", error).message);
        throw error;
    }
}

export async function processOrderRequest(order_info: IOrderRequestDTO) {
    let ORDER_BK = publisher.bindKeys.PublishHotelOrder;
    console.log(message.SERVICE.INFO.REQUEST_RECEIVED(`Order with id: ${order_info.order_id} received`, "", order_info).message);
    
    // check if the order already exists
    const orderExists = await orderRepository.read.checkExistance(order_info.order_id);
    if (orderExists) {
        console.log(message.SERVICE.WARNING.REQUEST_NOT_PROCESSED(`Order with id: ${order_info.order_id} already exists`, "", order_info).message);
        await updateExchange(ORDER_BK, { id: order_info.order_id, status: status.DENIED });
        return;
    }
    console.log(message.SERVICE.DEBUG.REQUEST_PROCESSED(`Order with id: ${order_info.order_id} does not exist`, "", order_info).message);
    
    // if the order does not exist, create the order
    let order = await orderRepository.write.createOrder(order_info);
    if (!order) {
        console.log(message.SERVICE.ERROR.ERROR_PROCESSING_REQUEST(`Error while creating order with id: ${order_info.order_id}`, "", order_info).message);
        await updateExchange(ORDER_BK, { id: order_info.order_id, status: status.DENIED });
        return;
    }
    console.log(message.SERVICE.INFO.REQUEST_PROCESSED(`Order with id: ${order_info.order_id} created`, "", order_info).message);

    //  check if the room is available for the requested dates
    const n_bookedDays = await hotelRepository.read.getBookedDays(order);
    if (!n_bookedDays) {
        console.log(message.SERVICE.WARNING.REQUEST_NOT_PROCESSED(`No dates found for the requested range`, "", order_info).message);
        let updatedOrder = await orderRepository.write.updateOrderStatus(order, status.DENIED);
        await updateExchange(ORDER_BK, { id: updatedOrder.order_id, status: updatedOrder.renting_status });
        return;
    }
    console.log(message.SERVICE.DEBUG.REQUEST_PROCESSED(`Dates found for the requested range`, "", order_info).message);

    // check if the room is available for the entire date range
    const roomAvailable = await hotelRepository.read.areRoomsAvailable(n_bookedDays, order.room);
    if (!roomAvailable) {
        console.log(message.SERVICE.WARNING.REQUEST_NOT_PROCESSED(`Room not available for the requested range`, "", order_info).message);
        let updatedOrder = await orderRepository.write.updateOrderStatus(order, status.DENIED);
        await updateExchange(ORDER_BK, { id: updatedOrder.order_id, status: updatedOrder.renting_status });
        return;
    }
    console.log(message.SERVICE.DEBUG.REQUEST_PROCESSED(`Room available for the requested range`, "", order_info).message);
    
    // if the room is available, update the room availability and approve the order
    await hotelRepository.write.updateRoomAvailability(n_bookedDays, order.room);
    let updatedOrder = await orderRepository.write.updateOrderStatus(order, status.APPROVED);
    await updateExchange(ORDER_BK, { id: updatedOrder.order_id, status: updatedOrder.renting_status });
    console.log(message.SERVICE.INFO.REQUEST_PROCESSED(`Order with id: ${order_info.order_id} approved`, "", order_info).message);
    
    return;
}

export async function processCancellatioRequest(order_id: string) {
    let ORDER_BK = publisher.bindKeys.PublishHotelOrder;
    console.log(message.SERVICE.INFO.REQUEST_RECEIVED(`Order with id: ${order_id} received`, "", { order_id }).message);


    const orderExists = await orderRepository.read.checkExistance(order_id);
    if (!orderExists) {
        console.warn(message.SERVICE.WARNING.REQUEST_NOT_PROCESSED(`Order with id: ${order_id} does not exist`, "", { order_id }).message);
        await updateExchange(ORDER_BK, { id: order_id, status: status.DENIED });
        return;
    }
    console.log(message.SERVICE.DEBUG.REQUEST_PROCESSED(`Order with id: ${order_id} exists`, "", { order_id }).message);

    let order = await orderRepository.read.getOrderInfo(order_id)!;
    if (!order) {
        console.log(message.SERVICE.ERROR.ERROR_PROCESSING_REQUEST(`Error while getting order with id: ${order_id}`, "", { order_id }).message);
        await updateExchange(ORDER_BK, { id: order_id, status: status.DENIED });
        return;
    }
    else {
        console.log(message.SERVICE.INFO.REQUEST_PROCESSED(`Order with id: ${order_id} found`, "", { order_id }).message);
        if (order.renting_status !== status.APPROVED) {
            console.log(message.SERVICE.WARNING.REQUEST_NOT_PROCESSED(`Order with id: ${order_id} is not approved cannot be cancelled`, "", { order_id }).message);
            await updateExchange(ORDER_BK, { id: order.order_id, status: status.DENIED });
        }
        console.log(message.SERVICE.DEBUG.REQUEST_PROCESSED(`Order with id: ${order_id} is approved`, "", { order_id }).message);

        const n_bookedDays = await await hotelRepository.read.getBookedDays(order)!;
        if (!n_bookedDays) {
            console.log(message.SERVICE.WARNING.REQUEST_NOT_PROCESSED(`No dates found for the requested range`, "", { order_id }).message);
            let updatedOrder = await orderRepository.write.updateOrderStatus(order, status.DENIED);
            await updateExchange(ORDER_BK, { id: updatedOrder.order_id, status: updatedOrder.renting_status });
            return;
        }
        console.log(message.SERVICE.DEBUG.REQUEST_PROCESSED(`Dates found for the requested range`, "", { order_id }).message);

        const roomAvailabilityRestored = await hotelRepository.write.restoreRoomAvailability(n_bookedDays, order.room);
        if (!roomAvailabilityRestored) {
            console.log(message.SERVICE.WARNING.REQUEST_NOT_PROCESSED(`Room availability not restored, updating order status to cancelled`, "", { order_id }).message);
            let updatedOrder = await orderRepository.write.updateOrderStatus(order, status.DENIED);
            await updateExchange(ORDER_BK, { id: updatedOrder.order_id, status: updatedOrder.renting_status });    
            return;
        }
        console.log(message.SERVICE.DEBUG.REQUEST_PROCESSED(`Room availability restored, updating order status to cancelled`, "", { order_id }).message);
        let updatedOrder =  await orderRepository.write.updateOrderStatus(order, status.CANCELLED);
        await updateExchange(ORDER_BK, { id: updatedOrder.order_id, status: updatedOrder.renting_status });
        console.log(message.SERVICE.INFO.REQUEST_PROCESSED(`Order with id: ${order_id} successfully cancelled`, "", { order_id }).message);
        return;
    }
}

