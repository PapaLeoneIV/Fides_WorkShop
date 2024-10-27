import { rabbitSub, rabbitPub } from "../models";

const BIKE_SERVICE_REQ_BIKE_QUEUE = "bike_service_bike_request"
const BIKE_SERVICE_SAGA_REQ_BIKE_QUEUE = "bike_service_saga_bike_request"


async function bootstrapRabbitConfig() {
    console.log("[BIKE SERVICE]PUB Connecting to RabbitMQ...");
    await rabbitPub.connect();
    console.log("[BIKE SERVICE]SUB Connecting to RabbitMQ...");

    await rabbitSub.connect();
    console.log("[BIKE SERVICE]Connected to RabbitMQ");

    console.log("[BIKE SERVICE]Setting up queues");
    await rabbitSub.createQueue(BIKE_SERVICE_REQ_BIKE_QUEUE);
    await rabbitSub.createQueue(BIKE_SERVICE_SAGA_REQ_BIKE_QUEUE);
}


export {
    bootstrapRabbitConfig,
}