import RabbitClient         from "./rabbit";
import HotelOrderRepository from "./order_manager";
import HotelDBRepository    from "./storage_manager";

const rabbitmqClient = new RabbitClient();
const order_manager = new HotelOrderRepository();
const storage_db = new HotelDBRepository();
export {
    rabbitmqClient,
    order_manager,
    storage_db
}