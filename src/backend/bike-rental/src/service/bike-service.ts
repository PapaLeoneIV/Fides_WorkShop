import IOrderRequestDTO from "../dtos/IOrderRequestDTO";
import { OrderStatus as status } from "../config/OrderStatus";
import { EXCHANGE } from "../config/rabbit-config";
import { publisher } from "../models/RabbitmqPublisher";
import { orderRepository } from "../repository/order-repository";
import { bikeRepository } from "../repository/bike-repository";

// Function to update the exchange with the new message
export async function updateExchange( bindKey: string, message: any ) {
    try {
        await publisher.publishEvent(EXCHANGE, bindKey, message);
    } catch (error) {
        console.error("[service] Error publishing event:", error);
        throw error;
    }
}

// Function to handle the creation of an order
export async function handleRequest( order_info: IOrderRequestDTO ) {
    let ORDER_BK = publisher.bindKeys.PublishBikeOrder;

    const orderExists = await orderRepository.read.checkExistance(order_info.order_id);
    if (orderExists) { 
        console.log("[service] Order already exists");
        await updateExchange(ORDER_BK, { id: order_info.order_id, status: status.DENIED });
        return;
    }
    console.log("[service] Order does not exist, creating order");
    let order = await orderRepository.write.createOrder(order_info);

    const hasSufficientBikes = await bikeRepository.read.checkAvailability(order.road_bike_requested, order.dirt_bike_requested);
    if (hasSufficientBikes) 
    {
        console.log("[service] Enough bikes available, approving order");
        await bikeRepository.write.decrementBikeCount(order.road_bike_requested, order.dirt_bike_requested);
        let updatedOrder = await orderRepository.write.updateStatus(order, status.APPROVED);
        await updateExchange(ORDER_BK, { id: updatedOrder.order_id, status: updatedOrder.renting_status });
        return;
    }
    console.log("[service] Not enough bikes available, denying order");
    let updatedOrder = await orderRepository.write.updateStatus(order, status.DENIED);
    await updateExchange(ORDER_BK, { id: updatedOrder.order_id, status: updatedOrder.renting_status });
    return;
}

// Function to handle the cancellation of an order
export async function handleCancellation( order_id: string ) {
    let ORDER_BK = publisher.bindKeys.PublishBikeOrder;
    let ORDER_SAGA_BK = publisher.bindKeys.PublishbikeSAGAOrder;
    
    const orderExists = await orderRepository.read.checkExistance(order_id );
    if(!orderExists)
    {
        console.log("[service] Order with id: ", order_id, "does not exist");
        await updateExchange(ORDER_SAGA_BK, { id: order_id, status: status.DENIED });
        return;
    }
    
    let order = await orderRepository.read.getOrderInfo(order_id)!;
    if (order && order.renting_status !== status.APPROVED)
    {
        console.log("[service] Order with id: ", order_id, "is not approved, cannot cancel");
        await updateExchange(ORDER_SAGA_BK, { id: order.order_id, status: status.DENIED });
        return;
    }
    
    if (order) {
        console.log("[service] Cancelling order with id: ", order_id);
        bikeRepository.write.incrementBikeCount(order.road_bike_requested, order.dirt_bike_requested);
        let updatedOrder = await orderRepository.write.updateStatus(order, status.CANCELLED);
        await updateExchange(ORDER_BK, { id: updatedOrder.order_id, status: updatedOrder.renting_status });
    }
}

