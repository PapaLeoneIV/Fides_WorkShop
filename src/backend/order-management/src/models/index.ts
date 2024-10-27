import {RabbitPublisher, RabbitSubscriber} from "./rabbit";
import OrderManagerDB from "./order_manager";


const REQ_BIKE_QUEUE = "bike_request"
const REQ_HOTEL_QUEUE = "hotel_request"
const REQ_PAYMENT_QUEUE = "payment_request"
const REQ_BOOKING_QUEUE = "booking_request"

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
    await rabbitSub.createQueue(REQ_BOOKING_QUEUE);
    await rabbitSub.createQueue(REQ_BIKE_QUEUE);
    await rabbitSub.createQueue(REQ_HOTEL_QUEUE);
    await rabbitSub.createQueue(REQ_PAYMENT_QUEUE);
}


export {
    rabbitPub,
    rabbitSub,
    orderManagerDB
}
