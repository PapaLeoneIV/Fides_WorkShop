import { rabbitPub, rabbitSub } from "../models/index";
import { PAYMENT_SERVICE_RESP_PAYMENT_QUEUE } from "../config/rabbit";

async function bootstrapRabbitConfig() {
    console.log("[PAYMENT SERVICE]PUB Connecting to RabbitMQ...");
    await rabbitPub.connect();
    console.log("[PAYMENT SERVICE]SUB Connecting to RabbitMQ...");

    await rabbitSub.connect();
    console.log("[PAYMENT SERVICE]Connected to RabbitMQ");

    console.log("[PAYMENT SERVICE]Setting up queues");
    console.log("[PAYMENT SERVICE]Setting up queues");
    await rabbitSub.createQueue(PAYMENT_SERVICE_RESP_PAYMENT_QUEUE);
}

export default bootstrapRabbitConfig;