import { rabbitPub, orderManager, bikeDBManager } from "../models/index";
import BikeOrderDTO from "../dtos/bikeOrder.dto";
import { bike_info_schema } from "../zodschema";
import { APPROVED, CANCELLED, DENIED } from "../config/status";
import { order as BikeEntity } from "@prisma/client";

async function checkBikeAvailability(order: BikeEntity): Promise<boolean> {
  const availableDirtBikes = await bikeDBManager.get_number_dirt_bikes();
  const availableRoadBikes = await bikeDBManager.get_number_road_bikes();
  return (
    availableDirtBikes >= order.dirt_bike_requested &&
    availableRoadBikes >= order.road_bike_requested
  );
}

export async function handle_req_from_order_management(msg: string) {
  let order_info: BikeOrderDTO;

  try {
    console.log("[BIKE SERVICE] Parsing message ", JSON.parse(msg));
    order_info = bike_info_schema.parse((JSON.parse(msg)));
  } catch (error) {
    console.error(`[BIKE SERVICE] Error while parsing message:`, error);
    await rabbitPub.publish_to_order_management({ id: "", status: DENIED });
    return;
  }

  const orderExists = await orderManager.check_existance(order_info.order_id);
  if (orderExists)
  {
    console.log("[BIKE SERVICE] Order already exists");
    await rabbitPub.publish_to_order_management({ id: order_info.order_id, status: DENIED });
    return;
  }

  console.log("[BIKE SERVICE] Order does not exist, creating order");

  let order: BikeEntity = await orderManager.create_order(order_info);

  const hasSufficientBikes = await checkBikeAvailability(order);
  if (hasSufficientBikes) 
  {
    console.log("[BIKE SERVICE] Order with id:", order.order_id, APPROVED);
    await bikeDBManager.decrement_bike_count(order.road_bike_requested, order.dirt_bike_requested);
    order = await orderManager.update_status(order, APPROVED);
    await rabbitPub.publish_to_order_management({ id: order_info.order_id, status: order.renting_status });
    return;
  }

  console.log("[BIKE SERVICE] Order  with id : ", order.order_id, "DENIED, there were not enough bikes");
  order = await orderManager.update_status(order, DENIED);

  //invece di mandarlo direttamente al message broker devo salvarlo dentro il database e avere un altro processo che gestisce l invio
  rabbitPub.publish_to_order_management({ id: order.order_id, status: order.renting_status });
  return;
}

export async function handle_cancel_request(msg: string) {
  let order_id: string;
  try {
    console.log("[BIKE SERVICE] Parsing message ", JSON.parse(msg));
    order_id = JSON.parse(msg);
  } catch (error) {
    console.error(`[BIKE SERVICE] Error while parsing message:`, error);
    await rabbitPub.publish_to_order_managementSAGA({ id: "", status: DENIED });
    return;
  }

  const orderExists = await orderManager.check_existance(order_id);
  if(!orderExists)
  {
    console.log("[BIKE SERVICE] Order with id: ", order_id, "does not exist");
    await rabbitPub.publish_to_order_managementSAGA({ id: order_id, status: DENIED });
    return;
  }

  let order = await orderManager.get_order_info(order_id)!;
  if (order && order.renting_status !== APPROVED)
  {
    console.log("[BIKE SERVICE] Order with id: ", order_id, "is not approved, cannot cancel");
    await rabbitPub.publish_to_order_managementSAGA({ id: order_id, status: DENIED });
    return;
  }

  if (order) {
    bikeDBManager.increment_bike_count(order.road_bike_requested, order.dirt_bike_requested);
    order = await orderManager.update_status(order, CANCELLED);
    rabbitPub.publish_to_order_managementSAGA({ id: order.order_id, status: order.renting_status });
  }
 

}

