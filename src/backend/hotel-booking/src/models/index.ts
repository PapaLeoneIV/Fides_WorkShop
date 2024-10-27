import {RabbitPublisher, RabbitSubscriber} from "./rabbit";
import HotelOrderRepository from "./order_manager";
import HotelDBRepository    from "./storage_manager";



const rabbitPub = new RabbitPublisher();
const rabbitSub = new RabbitSubscriber();
const order_manager = new HotelOrderRepository();
const storage_db = new HotelDBRepository();


export {
    rabbitPub,
    rabbitSub,
    order_manager,
    storage_db
}