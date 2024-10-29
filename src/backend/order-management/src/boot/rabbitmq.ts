import {rabbitPub, rabbitSub} from "../models/";
import { ORDER_SERVICE_BIKE_RESP_QUEUE, ORDER_SERVICE_HOTEL_RESP_QUEUE, ORDER_SERVICE_SAGA_BIKE_RESP_QUEUE, ORDER_SERVICE_SAGA_HOTEL_RESP_QUEUE, ORDER_SERVICE_RESP_PAYMENT_QUEUE, ORDER_SERVICE_REQ_BOOKING_QUEUE } from "../config/rabbit";

async function bootstrapRabbitConfig() {
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
    bootstrapRabbitConfig
}