import BikeOrderDTO from "../dtos/bikeOrder.dto";
import { OrderRepository } from "../database/repositories/orderRepository";


export async function handleRequest( order_info: BikeOrderDTO ) {

    const orderExists = await OrderRepository.check_existance(order_info.order_id);
    if (orderExists)
    {
        await rabbitPub.publish_to_order_management({ id: order_info.order_id, status: DENIED });
        return;
    }

    console.log("[BIKE SERVICE] Order does not exist, creating order");

    let order: BikeEntity = await OrderRepository.create_order(order_info);

    const hasSufficientBikes = await OrderRepository.check_availability(order.road_bike_requested, order.dirt_bike_requested);
    if (hasSufficientBikes) 
    {
        await bikeDBManager.decrement_bike_count(order.road_bike_requested, order.dirt_bike_requested);
        await updateOrder_and_publishEvent(order, APPROVED);
        return;
    }
    await updateOrder_and_publishEvent(order, DENIED);
    return;
}