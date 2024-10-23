import {rabbitmqClient, orderManager, bikeDBManager} from "../models/index";
import { OrderDTO as BikeDTO } from "../models/order_manager";
import { order as BikeDO } from "@prisma/client";
import { bike_info_schema } from "../zodschema";

export async function handle_req_from_order_management(msg: string) {
  let order_info: BikeDTO;

  try {
    order_info = bike_info_schema.parse(JSON.parse(msg));
  } catch (error) {
    console.error(`[BIKE SERVICE] Error while parsing message:`, error);
    await rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id: "", status: "DENIED"}));
    return;
  }

  if (await orderManager.check_existance(order_info.order_id)) {
    console.log("[BIKE SERVICE] Order already exists");
    await rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id: order_info.order_id , status: "DENIED"}));
    return;
  }
  console.log("[BIKE SERVICE] Order does not exist, creating order");
  
  let order: BikeDO = await orderManager.create_order(order_info);


  if (await bikeDBManager.get_number_dirt_bikes() >= order.dirt_bike_requested
    && await bikeDBManager.get_number_road_bikes() >= order.road_bike_requested) {

    console.log("[BIKE SERVICE] Order  with id : ", order.order_id, "APPROVED");
    bikeDBManager.decrement_bike_count(order.road_bike_requested, order.dirt_bike_requested);
    order = await orderManager.update_status(order, "APPROVED");


    rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id: order.order_id , status: order.renting_status}));
    return;
  }
  console.log("[BIKE SERVICE] Order  with id : ", order.order_id, "DENIED, there were not enough bikes");
  order = await orderManager.update_status(order, "DENIED");

  //invece di mandarlo direttamente al message broker devo salvarlo dentro il database e avere un altro processo che gestisce l invio
  rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id: order.order_id , status: order.renting_status}));
  return;
}

export async function handle_cancel_request(msg: string) {
  let order_id : string; 
  try {
    order_id = JSON.parse(msg);
  } catch (error) {
    console.error(`[BIKE SERVICE] Error while parsing message:`, error);
    await rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id: "", status: "DENIED"}));
    return;
  }

  if (await orderManager.check_existance(order_id)) {
    let order = await orderManager.get_order_info(order_id)!;
    if (order && order.renting_status === "APPROVED") {
      bikeDBManager.increment_bike_count(order.road_bike_requested, order.dirt_bike_requested);
      order = await orderManager.update_status(order, "CANCELLED");

      rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id: order.order_id, status: order.renting_status}));
    }
    else {
      console.log("[BIKE SERVICE] Order with id: ", order_id, "is not approved, cannot cancel");
      rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id: order_id, status: "DENIED"}))
    }
  } else {
    console.log("[BIKE SERVICE] Order with id: ", order_id, "does not exist");
    rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id: order_id, status: "DENIED"}))
  }
}

