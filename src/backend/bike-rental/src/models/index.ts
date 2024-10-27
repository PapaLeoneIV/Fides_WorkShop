import {RabbitPublisher, RabbitSubscriber} from "./rabbit";
import BikeOrderRepository from "./order_manager";
import BikeDBRepository from "./storage_manager";


const BIKE_SERVICE_REQ_BIKE_QUEUE = "bike_service_bike_request"
const BIKE_SERVICE_SAGA_REQ_BIKE_QUEUE = "bike_service_saga_bike_request"


const rabbitPub = new RabbitPublisher();
const rabbitSub = new RabbitSubscriber();

const orderManager = new BikeOrderRepository();
const bikeDBManager = new BikeDBRepository();

export async function bootstrapRabbitConfig() {
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
    rabbitPub,
    rabbitSub,
    orderManager,
    bikeDBManager
}
