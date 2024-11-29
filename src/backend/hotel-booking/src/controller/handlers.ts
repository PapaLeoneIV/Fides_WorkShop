import { order as HotelEntity } from "@prisma/client";
import HotelOrderDTO from "../dtos/hotelOrder.dto";
import { rabbitPub } from "../models";
import { order_manager } from "../models";
import { storage_db } from "../models";
import { hotel_info_schema } from "../parser/orderschema";
import { DENIED, APPROVED, CANCELLED } from "../config/status";
import { parse_request } from "../parser/helpers";


async function updateStatus_and_publishEvent(order: HotelEntity, status: string) {
  order = await order_manager.update_status(order, status);
  rabbitPub.publish_to_order_management({ id: order.order_id, status: order.renting_status });
}

export async function handle_req_from_order_management(msg: string) {
  let order_info: HotelOrderDTO;
  let order: HotelEntity;
  order_info = await parse_request(msg, hotel_info_schema);

  const orderExists = await order_manager.check_existance(order_info.order_id);
  if (orderExists) {
    console.log("[HOTEL SERVICE] Order already exists");
    await rabbitPub.publish_to_order_management({ id: order_info.order_id, status: DENIED });
    return;
  }
  console.log("[HOTEL SERVICE] Order does not exist, creating order");

  order = await order_manager.create_order(order_info);
  if (!order) {
    console.log("[HOTEL SERVICE] Error creating order");
    await rabbitPub.publish_to_order_management({ id: order_info.order_id, status: DENIED });
    return;
  }
  const n_bookedDays = await storage_db.getBookedDays(order);

  if (!n_bookedDays) {
    console.log("[HOTEL SERVICE] No dates found for the requested range.");
    await updateStatus_and_publishEvent(order, DENIED);
    return;
  }
  const roomAvailable = await storage_db.areRoomsAvailable(n_bookedDays, order.room);
  if (!roomAvailable) {
    console.log("[HOTEL SERVICE] Room is not available for the entire date range.");
    await updateStatus_and_publishEvent(order, DENIED);
    return;
  }
  await storage_db.updateRoomAvailability(n_bookedDays, order.room);
  await updateStatus_and_publishEvent(order, APPROVED);
  return;
}



export async function handle_cancel_request(order_id: string) {

  order_id = JSON.parse(order_id);
  
  const orderExists = await order_manager.check_existance(order_id);
  
  if (!orderExists) {
    console.log("[HOTEL SERVICE] Order with id: ", order_id, "does not exist");
    rabbitPub.publish_to_order_management({ id: order_id, status: DENIED });
    return;
  }

  let order = await order_manager.get_order_info(order_id)!;

  if (!order) {
    console.log("[HOTEL SERVICE] Error while fetching order with id: ", order_id);
    rabbitPub.publish_to_order_management({ id: order_id, status: DENIED });
    return
  }
  else {
    if (order.renting_status !== APPROVED) {
      console.log("[HOTEL SERVICE] Order with id: ", order_id, "is not approved, cannot cancel");
      rabbitPub.publish_to_order_management({ id: order_id, status: DENIED });
    }

    const n_bookedDays =  await storage_db.getBookedDays(order)!;

    if (!n_bookedDays) {
      console.log("[HOTEL SERVICE]", "No dates found for the requested range.");
      await updateStatus_and_publishEvent(order, DENIED);
      return;
    }

    const roomAvailabilityRestored = await storage_db.restoreRoomAvailability(n_bookedDays, order.room);
    if (!roomAvailabilityRestored) {
      await updateStatus_and_publishEvent(order, DENIED);
      return
    }
    await updateStatus_and_publishEvent(order, CANCELLED);
  }

}

