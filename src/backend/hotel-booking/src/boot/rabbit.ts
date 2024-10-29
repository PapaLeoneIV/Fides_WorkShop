import { rabbitPub, rabbitSub } from "../models/index";
import { HOTEL_SERVICE_ORDER_REQ_QUEUE, HOTEL_SERVICE_SAGA_REQ_QUEUE } from "../config/rabbit";

async function bootstrapRabbitConfig() {
    console.log("[HOTEL SERVICE]PUB Connecting to RabbitMQ...");
    await rabbitPub.connect();
    console.log("[HOTEL SERVICE]SUB Connecting to RabbitMQ...");

    await rabbitSub.connect();
    console.log("[HOTEL SERVICE]Connected to RabbitMQ");

    console.log("[HOTEL SERVICE]Setting up queues");
    console.log("[HOTEL SERVICE]Setting up queues");
    await rabbitSub.createQueue(HOTEL_SERVICE_ORDER_REQ_QUEUE);
    await rabbitSub.createQueue(HOTEL_SERVICE_SAGA_REQ_QUEUE);
}

export default bootstrapRabbitConfig;