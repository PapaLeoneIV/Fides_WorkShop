import { RabbitClient } from "../router/rabbitMQClient";
import { order as HotelDO } from "@prisma/client";
import { HotelOrdersRepository, OrderDTO as HotelDTO } from "../service/OrderRepository/OrderRepository";
import { HotelDBRepository } from "../service/StorageRepository/StorageRepository";
import { z } from 'zod';

let hotel_info_schema = z.object({
  order_id: z.string(),
  to: z.string(),
  from: z.string(),
  room: z.string(),
  renting_status: z.string(),
  created_at: z.string().transform((val) => new Date(val)),
  updated_at: z.string().transform((val) => new Date(val)),
});

export async function handle_req_from_order_management(rabbitmqClient: RabbitClient, msg: string) {
  let order_info: HotelDTO;

  try {
    const data = JSON.parse(msg);
    const description = JSON.parse(data.description);
    order_info = hotel_info_schema.parse(description);
  } catch (error) {
    console.error(`[HOTEL SERVICE] Error while parsing message:`, error);
    await rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id: "", status: "DENIED"}));
    return;
  }

  const manager_db = new HotelOrdersRepository();
  const storage_db = new HotelDBRepository();


  if (await manager_db.check_existance(order_info.order_id)) {
    console.log("[HOTEL SERVICE] Order already exists");
    await rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id: order_info.order_id}));
    return;
  }
  console.log("[HOTEL SERVICE] Order does not exist, creating order");
  let order: HotelDO | null = await manager_db.create_order(order_info);
  if (order) {
    const dateRecords = await storage_db.getDateIdsForRange(new Date(order.from), new Date(order.to))
    const dateIds = dateRecords.map((date: any) => date.id);
    if (dateIds.length === 0) {
      console.log("[HOTEL SERVICE]", "No dates found for the requested range.");
      order = await manager_db.update_status(order, "DENIED");
      rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id: order.order_id, status: order.renting_status}));
      return;
    }

    if (!await storage_db.areRoomsAvailable(dateIds, order.room)) {
      console.log("[HOTEL SERVICE]", "Room is not available for the entire date range.");
      order = await manager_db.update_status(order, "DENIED");
      rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id: order.order_id, status: order.renting_status}));
      return;
    }
    await storage_db.updateRoomAvailability(dateIds, order.room);
    console.log(`[HOTEL SERVICE]Room ${order.room} has been successfully booked.`);
    order = await manager_db.update_status(order, "APPROVED");
    rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id: order.order_id, status: order.renting_status}));
    return;

  } else {
    console.log("[HOTEL SERVICE] Error creating order");
    await rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id: order_info.order_id, status: "DENIED" }));
    return;
  }
}

export async function handle_cancel_request(rabbitmqClient: RabbitClient, order_id: string) {
  const manager_db = new HotelOrdersRepository();
  const storage_db = new HotelDBRepository();

  if (await manager_db.check_existance(order_id)) {

    let order = await manager_db.get_order_info(order_id);

    if (order && order.renting_status === "APPROVED") {

      let dateRecords = await storage_db.getDateIdsForRange(new Date(order.from), new Date(order.to))
      const dateIds = dateRecords.map((date: any) => date.id);

      if (dateIds.length === 0) {
        console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "No dates found for the requested range.");
        order = await manager_db.update_status(order, "DENIED")
        rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id : order.order_id, status: order.renting_status}));
        return;
      }

      if (await storage_db.restoreRoomAvailability(dateIds, order.room)) {
        order =  await manager_db.update_status(order, "CANCELLED")
        rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id : order.order_id, status: order.renting_status}));
      }
      else {
        order = await manager_db.update_status(order, "DENIED")
        rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id : order.order_id, status: order.renting_status}));
      }

    }
    else {
      console.log("[HOTEL SERVICE] Order with id: ", order_id, "is not approved, cannot cancel");
      rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id: order_id, status: "DENIED"}));
    }
  } else {
    console.log("[HOTEL SERVICE] Order with id: ", order_id, "does not exist");
    rabbitmqClient.sendToOrderManagementMessageBroker(JSON.stringify({id: order_id, status: "DENIED"}));
  }
}

