import { rabbitSub, rabbitPub } from "../models";
import { BIKE_SERVICE_ORDER_REQ_QUEUE, BIKE_SERVICE_SAGA_REQ_QUEUE } from "../config/rabbit";

async function bootstrapRabbitConfig() {
    console.log("[BIKE SERVICE]PUB Connecting to RabbitMQ...");
    await rabbitPub.connect();
    console.log("[BIKE SERVICE]SUB Connecting to RabbitMQ...");

    await rabbitSub.connect();
    console.log("[BIKE SERVICE]Connected to RabbitMQ");

    console.log("[BIKE SERVICE]Setting up queues");
    await rabbitSub.createQueue(BIKE_SERVICE_ORDER_REQ_QUEUE);
    await rabbitSub.createQueue(BIKE_SERVICE_SAGA_REQ_QUEUE);
}


export {
    bootstrapRabbitConfig,
}