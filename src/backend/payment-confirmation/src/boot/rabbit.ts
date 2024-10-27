import { rabbitPub, rabbitSub } from "../models/index";

const PAYMENT_SERVICE_RESP_PAYMENT_QUEUE = "payment_service_payment_request"

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