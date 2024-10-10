import { RabbitMQConnection } from "./connection";
import { order as BikeDO } from "@prisma/client";
import { BikeOrderRepository, OrderDTO as BikeDTO } from "../api/service/OrderRepository/OrderRepository";
import { BikeStorageRepository } from "../api/service/StorageRepository/StorageRepository";
import {z} from "zod";

export async function handle_req_from_order_management(rabbitmqClient: RabbitMQConnection, msg: string) {
  try {
    console.log(`[BIKE SERVICE] Received Request from frontend:`, msg);

    console.log("[BIKE SERVICE] Parsing message");
    //TODO parse the message with zod
    const parsedMsg = JSON.parse(msg);
    const order_info = JSON.parse(parsedMsg.description);

    const manager_db = new BikeOrderRepository();
    const storage_db = new BikeStorageRepository();

    console.log("[BIKE SERVICE] Checking if order already exists");
    if (await manager_db.check_existance(order_info.order_id)) {
      console.log("[BIKE SERVICE] Order already exists");
      rabbitmqClient.sendToOrderManagementMessageBroker("ERROR");
      return;
    }
    console.log("[BIKE SERVICE] Order does not exist, creating order");
    console.log("[DEBUG BIKE SERVICE] Order info: ", order_info); 
    let order: BikeDO = await manager_db.create_order(order_info);

    if (await storage_db.get_number_dirt_bikes() >= order.dirt_bike_requested
      && await storage_db.get_number_road_bikes() >= order.road_bike_requested) {
      //SUCCESS
      console.log("[BIKE SERVICE] Order  with id : ", order.id, "approved");
      storage_db.decrement_bike_count(order.road_bike_requested, order.dirt_bike_requested);
      manager_db.update_status(order, "APPROVED");
      rabbitmqClient.sendToOrderManagementMessageBroker(order.renting_status);
      return;
    }
    //FAILURE
    console.log("[BIKE SERVICE] Order  with id : ", order.id, "rejected, there were nto enough bikes");
    manager_db.update_status(order, "DENIED");
    rabbitmqClient.sendToOrderManagementMessageBroker(order.renting_status);
    return;

  } catch (error) {
    console.error(`[BIKE SERVICE] Error while handling frontend request:`, error);
    rabbitmqClient.sendToOrderManagementMessageBroker("ERROR");
    return;
  }
}


//TODO implemnt SAGA logic

