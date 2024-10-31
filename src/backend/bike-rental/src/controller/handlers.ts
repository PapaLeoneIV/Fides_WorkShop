import { rabbitPub, orderManager, bikeDBManager } from "../models/index";
import BikeOrderDTO from "../dtos/bikeOrder.dto";
import { bike_info_schema } from "../zodschema/bikeschema";
import { cancel_req_schema } from "../zodschema/cancel_req_schema";
import { APPROVED, CANCELLED, DENIED } from "../config/status";
import { order as BikeEntity } from "@prisma/client";
import { string } from "zod";



async function checkBikeAvailability(order: BikeEntity): Promise<boolean> {
  const availableDirtBikes = await bikeDBManager.get_number_dirt_bikes();
  const availableRoadBikes = await bikeDBManager.get_number_road_bikes();
  return (
    availableDirtBikes >= order.dirt_bike_requested &&
    availableRoadBikes >= order.road_bike_requested
  );
}

async function updateOrder_and_publishEvent(order: BikeEntity, status: string) {
  order = await orderManager.update_status(order, status);
  rabbitPub.publish_to_order_management({ id: order.order_id, status: order.renting_status });
}


async function parse_request(msg: string, schema: any) {
  try {
    let parsedMessage = JSON.parse(msg);
    if (typeof parsedMessage === "string") return parsedMessage;
    else return schema.parse(parsedMessage);
  } catch (error) {
    console.error(`[BIKE SERVICE] Error while parsing message:`, error);
    rabbitPub.publish_to_order_management({ id: "", status: DENIED });
    throw new Error("Error while parsing message");
  }
}

export async function handle_req_from_order_management(msg: string) {
  let order_info: BikeOrderDTO;

  order_info = await parse_request(msg, bike_info_schema);

  const orderExists = await orderManager.check_existance(order_info.order_id);
  if (orderExists)
  {
    await rabbitPub.publish_to_order_management({ id: order_info.order_id, status: DENIED });
    return;
  }

  console.log("[BIKE SERVICE] Order does not exist, creating order");

  let order: BikeEntity = await orderManager.create_order(order_info);

  const hasSufficientBikes = await checkBikeAvailability(order);
  if (hasSufficientBikes) 
  {
    await bikeDBManager.decrement_bike_count(order.road_bike_requested, order.dirt_bike_requested);
    await updateOrder_and_publishEvent(order, APPROVED);
    return;
  }
  await updateOrder_and_publishEvent(order, DENIED);
  return;
}

export async function handle_cancel_request(msg: string) {
  let order_id: string;
  
  order_id = await parse_request(msg, cancel_req_schema);

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
    await updateOrder_and_publishEvent(order, CANCELLED);
  }
}

