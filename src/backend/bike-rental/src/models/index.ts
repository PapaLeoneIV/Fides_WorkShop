import {RabbitPublisher, RabbitSubscriber} from "./rabbit";
import OrderRepository from "../database/repositories/orderRepository";
import BikeRepository from "../database/repositories/bikeRepository";

export const rabbitPub = new RabbitPublisher();
export const rabbitSub = new RabbitSubscriber();

// export const orderManager = new OrderRepository();
// export const bikeDBManager = new BikeRepository();

