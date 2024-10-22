import RabbitClient from "./rabbit";
import BikeOrderRepository from "./order_manager";
import BikeDBRepository from "./storage_manager";

const rabbitmqClient = new RabbitClient();
const orderManager = new BikeOrderRepository();
const bikeDBManager = new BikeDBRepository();

export {
    rabbitmqClient,
    orderManager,
    bikeDBManager
}