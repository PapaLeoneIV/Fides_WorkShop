import {RabbitPublisher, RabbitSubscriber} from "./rabbit";
import BikeOrderRepository from "./order_manager";
import BikeDBRepository from "./storage_manager";

const rabbitPub = new RabbitPublisher();
const rabbitSub = new RabbitSubscriber();

const orderManager = new BikeOrderRepository();
const bikeDBManager = new BikeDBRepository();

export {
    rabbitPub,
    rabbitSub,
    orderManager,
    bikeDBManager
}
