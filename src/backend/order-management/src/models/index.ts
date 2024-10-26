import {RabbitPublisher, RabbitSubscriber} from "./rabbit";
import OrderManagerDB from "./order_manager";


const REQ_BIKE_QUEUE = "bike_request"
const REQ_HOTEL_QUEUE = "hotel_request"
const REQ_PAYMENT_QUEUE = "payment_request"
const REQ_BOOKING_QUEUE = "booking_request"

const rabbitPub = new RabbitPublisher();
const rabbitSub = new RabbitSubscriber();


rabbitPub.connect();

await rabbitPub.setupExchange("OrderEventExchange", "direct");

rabbitSub.connect();

await rabbitSub.createQueue(REQ_BOOKING_QUEUE);
await rabbitSub.createQueue(REQ_BIKE_QUEUE);
await rabbitSub.createQueue(REQ_HOTEL_QUEUE);
await rabbitSub.createQueue(REQ_PAYMENT_QUEUE);

const orderManagerDB = new OrderManagerDB();

export {
    rabbitPub,
    rabbitSub,
    orderManagerDB
}
