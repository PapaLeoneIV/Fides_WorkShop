import {RabbitPublisher, RabbitSubscriber} from "./rabbit";
import BikeOrderRepository from "./order_manager";
import BikeDBRepository from "./storage_manager";

export const rabbitPub = new RabbitPublisher();
export const rabbitSub = new RabbitSubscriber();

export const orderManager = new BikeOrderRepository();
export const bikeDBManager = new BikeDBRepository();

