import {RabbitPublisher, RabbitSubscriber} from "./rabbit";
import HotelOrderRepository from "./order_manager";
import HotelDBRepository    from "./storage_manager";
const HOTEL_SERVICE_ORDER_REQ_QUEUE = "hotel_service_hotel_request"
const HOTEL_SERVICE_SAGA_REQ_QUEUE = "hotel_service_saga_hotel_request"


const rabbitPub = new RabbitPublisher();
const rabbitSub = new RabbitSubscriber();
const order_manager = new HotelOrderRepository();
const storage_db = new HotelDBRepository();



export async function bootstrapRabbitConfig() {
    console.log("[HOTEL SERVICE]PUB Connecting to RabbitMQ...");
    await rabbitPub.connect();
    console.log("[HOTEL SERVICE]SUB Connecting to RabbitMQ...");

    await rabbitSub.connect();
    console.log("[HOTEL SERVICE]Connected to RabbitMQ");

    console.log("[HOTEL SERVICE]Setting up queues");
    console.log("[BIKE SERVICE]Setting up queues");
    await rabbitSub.createQueue(HOTEL_SERVICE_ORDER_REQ_QUEUE);
    await rabbitSub.createQueue(HOTEL_SERVICE_SAGA_REQ_QUEUE);
}

export {
    rabbitPub,
    rabbitSub,
    order_manager,
    storage_db
}