import {RabbitPublisher, RabbitSubscriber} from "./rabbit";
import OrderManagerDB from "./order_manager";



const rabbitPub = new RabbitPublisher();
const rabbitSub = new RabbitSubscriber();
const orderManagerDB = new OrderManagerDB();

export {
    rabbitPub,
    rabbitSub,
    orderManagerDB
}
