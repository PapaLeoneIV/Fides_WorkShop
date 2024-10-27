import {RabbitPublisher, RabbitSubscriber} from "./rabbit";
import OrderManagerDB from "./order_manager";

const ORDER_SERVICE_BIKE_RESP_QUEUE = "order_service_bike_response"
const ORDER_SERVICE_HOTEL_RESP_QUEUE = "order_service_hotel_response"
const ORDER_SERVICE_SAGA_BIKE_RESP_QUEUE = "order_service_SAGA_hotel_request"
const ORDER_SERVICE_SAGA_HOTEL_RESP_QUEUE = "order_service_SAGA_bike_request"
const ORDER_SERVICE_RESP_PAYMENT_QUEUE = "order_service_payment_request"
const ORDER_SERVICE_REQ_BOOKING_QUEUE = "order_service_booking_request"

const rabbitPub = new RabbitPublisher();
const rabbitSub = new RabbitSubscriber();
const orderManagerDB = new OrderManagerDB();

export async function bootstrapRabbitConfig() {
    console.log("[ORDER SERVICE]PUB Connecting to RabbitMQ...");
    await rabbitPub.connect();
    console.log("[ORDER SERVICE]SUB Connecting to RabbitMQ...");

    await rabbitSub.connect();
    console.log("[ORDER SERVICE]Connected to RabbitMQ");
    console.log("[ORDER SERVICE]Setting up exchanges");
    await rabbitPub.setupExchange("OrderEventExchange", "direct");

    console.log("[ORDER SERVICE]Setting up queues");
    
    await rabbitSub.createQueue(ORDER_SERVICE_BIKE_RESP_QUEUE);
    await rabbitSub.createQueue(ORDER_SERVICE_HOTEL_RESP_QUEUE);
    await rabbitSub.createQueue(ORDER_SERVICE_SAGA_BIKE_RESP_QUEUE);
    await rabbitSub.createQueue(ORDER_SERVICE_SAGA_HOTEL_RESP_QUEUE);
    await rabbitSub.createQueue(ORDER_SERVICE_RESP_PAYMENT_QUEUE);
    await rabbitSub.createQueue(ORDER_SERVICE_REQ_BOOKING_QUEUE);
}


export {
    rabbitPub,
    rabbitSub,
    orderManagerDB
}
