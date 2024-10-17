import { RabbitClient } from "../router/rabbitMQClient";
import { order as BikeDO } from "@prisma/client";
import { BikeOrderRepository, OrderDTO as BikeDTO } from "../service/OrderRepository/OrderRepository";
import { BikeDBRepository } from "../service/StorageRepository/StorageRepository";
import { z } from 'zod';

let bike_info_schema = z.object({
  order_id: z.string(),
  road_bike_requested: z.number().refine((val) => val >= 0 && Number.isInteger(val)),
  dirt_bike_requested: z.number().refine((val) => val >= 0 && Number.isInteger(val)),
  renting_status: z.string(),
  created_at: z.string().transform((val) => new Date(val)),
  updated_at: z.string().transform((val) => new Date(val)),
});

export async function handle_req_from_order_management(rabbitmqClient: RabbitClient, msg: string) {
  let order_info: BikeDTO;

  try {
    const data = JSON.parse(msg);
    const description = JSON.parse(data.description);
    order_info = bike_info_schema.parse(description);
  } catch (error) {
    console.error(`[BIKE SERVICE] Error while parsing message:`, error);
    await rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id: "", status: "DENIED"}));
    return;
  }

  const manager_db = new BikeOrderRepository();
  const storage_db = new BikeDBRepository();

  if (await manager_db.check_existance(order_info.order_id)) {
    console.log("[BIKE SERVICE] Order already exists");
    await rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id: order_info.order_id , status: "DENIED"}));
    return;
  }
  console.log("[BIKE SERVICE] Order does not exist, creating order");
  
  let order: BikeDO = await manager_db.create_order(order_info);


  if (await storage_db.get_number_dirt_bikes() >= order.dirt_bike_requested
    && await storage_db.get_number_road_bikes() >= order.road_bike_requested) {

    console.log("[BIKE SERVICE] Order  with id : ", order.order_id, "APPROVED");
    storage_db.decrement_bike_count(order.road_bike_requested, order.dirt_bike_requested);
    order = await manager_db.update_status(order, "APPROVED");


    rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id: order.order_id , status: order.renting_status}));
    return;
  }
  console.log("[BIKE SERVICE] Order  with id : ", order.order_id, "DENIED, there were not enough bikes");
  order = await manager_db.update_status(order, "DENIED");

  //invece di mandarlo direttamente al message broker devo salvarlo dentro il database e avere un altro processo che gestisce l invio
  rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id: order.order_id , status: order.renting_status}));
  return;
}

export async function handle_cancel_request(rabbitmqClient: RabbitClient, msg: string) {
  let order_id : string; 
  try {
    const data = JSON.parse(msg);
    order_id = data.description;
  } catch (error) {
    console.error(`[BIKE SERVICE] Error while parsing message:`, error);
    await rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id: "", status: "DENIED"}));
    return;
  }


  const manager_db = new BikeOrderRepository();
  const storage_db = new BikeDBRepository();

  if (await manager_db.check_existance(order_id)) {
    let order = await manager_db.get_order_info(order_id)!;
    if (order && order.renting_status === "APPROVED") {
      storage_db.increment_bike_count(order.road_bike_requested, order.dirt_bike_requested);
      order = await manager_db.update_status(order, "CANCELLED");
      //invece di mandarlo direttamente al message broker devo salvarlo dentro il database e avere un altro processo che gestisce l invio

      rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id: order.order_id, status: order.renting_status}));
    }
    else {
      console.log("[BIKE SERVICE] Order with id: ", order_id, "is not approved, cannot cancel");
      //invece di mandarlo direttamente al message broker devo salvarlo dentro il database e avere un altro processo che gestisce l invio
      rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id: order_id, status: "DENIED"}))
    }
  } else {
    console.log("[BIKE SERVICE] Order with id: ", order_id, "does not exist");
    rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id: order_id, status: "DENIED"}))
  }
}

