import { rabbitSub, rabbitPub } from "../models";
import { BIKE_SERVICE_ORDER_REQ_QUEUE, BIKE_SERVICE_SAGA_REQ_QUEUE } from "../config/rabbit";

const bikeKeysUrl = "http://config-service:3000/config/bikeKeys";


async function bootstrapRabbitConfig() {

    rabbitPub.bindKeys = await rabbitPub.requestBindingKeys(bikeKeysUrl);
    rabbitSub.bindKeys = await rabbitSub.requestBindingKeys(bikeKeysUrl);
    
    await rabbitPub.connect();

    await rabbitSub.connect();
    console.log("[BIKE SERVICE] Connected to RabbitMQ");

    console.log("[BIKE SERVICE] Setting up queues");
    await rabbitSub.createQueue(BIKE_SERVICE_ORDER_REQ_QUEUE);
    await rabbitSub.createQueue(BIKE_SERVICE_SAGA_REQ_QUEUE);
}


export {
    bootstrapRabbitConfig,
}