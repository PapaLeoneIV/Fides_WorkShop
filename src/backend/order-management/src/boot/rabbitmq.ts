import {rabbitPub, rabbitSub} from "../models/";
import { ORDER_SERVICE_BIKE_RESP, ORDER_SERVICE_HOTEL_RESP, ORDER_SERVICE_SAGA_BIKE_RESP, ORDER_SERVICE_SAGA_HOTEL_RESP, ORDER_SERVICE_RESP_PAYMENT, ORDER_SERVICE_REQ_BOOKING } from "../config/rabbit";


const bindingKeysUrl = "http://config-service:3000/config/orderKeys";

async function bootstrapRabbitConfig() {
    
    rabbitPub.bindKeys = await rabbitPub.requestBindingKeys(bindingKeysUrl);
    rabbitSub.bindKeys = await rabbitSub.requestBindingKeys(bindingKeysUrl);
    
    console.log("[ORDER SERVICE]PUB Connecting to RabbitMQ...");
    await rabbitPub.connect();
    console.log("[ORDER SERVICE]SUB Connecting to RabbitMQ...");

    await rabbitSub.connect();
    console.log("[ORDER SERVICE]Connected to RabbitMQ");
    console.log("[ORDER SERVICE]Setting up exchanges");
    await rabbitPub.setupExchange("OrderEventExchange", "direct");

    console.log("[ORDER SERVICE]Setting up queues");
    
    await rabbitSub.createQueue(ORDER_SERVICE_BIKE_RESP);
    await rabbitSub.createQueue(ORDER_SERVICE_HOTEL_RESP);
    await rabbitSub.createQueue(ORDER_SERVICE_SAGA_BIKE_RESP);
    await rabbitSub.createQueue(ORDER_SERVICE_SAGA_HOTEL_RESP);
    await rabbitSub.createQueue(ORDER_SERVICE_RESP_PAYMENT);
    await rabbitSub.createQueue(ORDER_SERVICE_REQ_BOOKING);
}

export {
    bootstrapRabbitConfig
}