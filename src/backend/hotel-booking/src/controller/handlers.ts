import { order as HotelEntity } from "@prisma/client";
import HotelOrderDTO from "../dtos/hotelOrder.dto";
import { rabbitPub } from "../models";
import { order_manager } from "../models";
import { storage_db } from "../models";
import { DENIED, APPROVED, CANCELLED } from "../config/status";

export async function handle_req_from_order_management(msg: string) {
  let order_info: HotelOrderDTO;

  try {
    order_info = JSON.parse(msg);
  } catch (error) {
    console.error(`[HOTEL SERVICE] Error while parsing message:`, error);
    await rabbitPub.publish_to_order_management(JSON.stringify({ id: "", status: DENIED }));
    return;
  }

  if (await order_manager.check_existance(order_info.order_id)) {
    console.log("[HOTEL SERVICE] Order already exists");
    await rabbitPub.publish_to_order_management(JSON.stringify({ id: order_info.order_id }));
    return;
  }
  console.log("[HOTEL SERVICE] Order does not exist, creating order");
  let order: HotelEntity | null = await order_manager.create_order(order_info);
  if (order) {
    const dateRecords = await storage_db.getDateIdsForRange(new Date(order.from), new Date(order.to))
    const dateIds = dateRecords.map((date: any) => date.id);
    if (dateIds.length === 0) {
      rabbitPub.publish_to_order_management(JSON.stringify({ id: order.order_id, status: order.renting_status }));
      return;
    }

    if (!await storage_db.areRoomsAvailable(dateIds, order.room)) {
      console.log("[HOTEL SERVICE] Room is not available for the entire date range.");
      order = await order_manager.update_status(order, DENIED);
      rabbitPub.publish_to_order_management(JSON.stringify({ id: order.order_id, status: order.renting_status }));
      return;
    }
    await storage_db.updateRoomAvailability(dateIds, order.room);
    console.log(`[HOTEL SERVICE] Room ${order.room} has been successfully booked.`);
    order = await order_manager.update_status(order, APPROVED);
    rabbitPub.publish_to_order_management(JSON.stringify({ id: order.order_id, status: order.renting_status }));
    return;

  } else {
    console.log("[HOTEL SERVICE] Error creating order");
    await rabbitPub.publish_to_order_management(JSON.stringify({ id: order_info.order_id, status: DENIED }));
    return;
  }
}

export async function handle_cancel_request(order_id: string) {

  if (await order_manager.check_existance(order_id)) {

    let order = await order_manager.get_order_info(order_id);

    if (order && order.renting_status === APPROVED) {

      let dateRecords = await storage_db.getDateIdsForRange(new Date(order.from), new Date(order.to))
      const dateIds = dateRecords.map((date: any) => date.id);

      if (dateIds.length === 0) {
        console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "No dates found for the requested range.");
        order = await order_manager.update_status(order, DENIED)
        rabbitPub.publish_to_order_management(JSON.stringify({ id: order.order_id, status: order.renting_status }));
        return;
      }

      if (await storage_db.restoreRoomAvailability(dateIds, order.room)) {
        order = await order_manager.update_status(order, CANCELLED)
        rabbitPub.publish_to_order_management(JSON.stringify({ id: order.order_id, status: order.renting_status }));
      }
      else {
        order = await order_manager.update_status(order, DENIED)
        rabbitPub.publish_to_order_management(JSON.stringify({ id: order.order_id, status: order.renting_status }));
      }

    }
    else {
      console.log("[HOTEL SERVICE] Order with id: ", order_id, "is not approved, cannot cancel");
      rabbitPub.publish_to_order_management(JSON.stringify({ id: order_id, status: DENIED }));
    }
  } else {
    console.log("[HOTEL SERVICE] Order with id: ", order_id, "does not exist");
    rabbitPub.publish_to_order_management(JSON.stringify({ id: order_id, status: DENIED }));
  }
}

