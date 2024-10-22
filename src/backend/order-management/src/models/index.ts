import RabbitClient from "./rabbit";
import OrderManagerDB from "./order_manager";

const rabbitmqClient = new RabbitClient();
const orderManagerDB = new OrderManagerDB();

export {
    rabbitmqClient,
    orderManagerDB
}
