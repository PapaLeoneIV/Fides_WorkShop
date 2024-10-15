import { RabbitClient } from "../router/rabbitMQClient";
import { OrderDTO, OrderManagerDB } from "../service/orderService";
import { order as OrderDO } from "@prisma/client";
import { z } from 'zod';


const order_info_schema = z.object({

  from: z.string(),
  to: z.string(),
  room: z.string(),

  road_bike_requested: z.number().refine((val) => val >= 0 && Number.isInteger(val)),
  dirt_bike_requested: z.number().refine((val) => val >= 0 && Number.isInteger(val)),

  amount: z.string(),

  bike_status: z.string(),
  hotel_status: z.string(),
  payment_status: z.string(),


  created_at: z.date(),
  updated_at: z.date()
});


const response_schema = z.object({
  id: z.string(),
  status: z.string()
});


function parse_data_from_response(msg: string) {
  let data: { id: string, status: string };
  const req = JSON.parse(msg);
  const description = JSON.parse(req.description);
  data = response_schema.parse(description);

  return data;
}


export async function handle_req_from_frontend(instance: RabbitClient, msg: string) {
  let data: OrderDTO;
  try {

    const parsedMsg = JSON.parse(msg);
    parsedMsg.created_at = new Date(parsedMsg.created_at);
    parsedMsg.updated_at = new Date(parsedMsg.updated_at);
    data = order_info_schema.parse(parsedMsg);

  } catch (error) {
    console.error(`[ORDER SERVICE] Error while parsing message:`, error);
    return;
  }

  const manager_db = new OrderManagerDB();

  const order = await manager_db.create_order(data);

  const bike_order = {
    order_id: order.id,
    road_bike_requested: order.road_bike_requested,
    dirt_bike_requested: order.dirt_bike_requested,
    renting_status: order.bike_status,
    created_at: order.created_at,
    updated_at: order.updated_at
  };

  const hotel_order = {
    order_id: order.id,
    to: order.to,
    from: order.from,
    room: order.room,
    renting_status: order.hotel_status,
    created_at: order.created_at,
    updated_at: order.updated_at
  };

  instance.sendToBikeMessageBroker(JSON.stringify(bike_order));
  instance.sendToHotelMessageBroker(JSON.stringify(hotel_order));

}


export async function handle_res_from_bike(instance: RabbitClient, msg: string) {
  let data: { id: string, status: string };
  let order: OrderDO;
  try {
    data = parse_data_from_response(msg)
  } catch (error) {
    console.error(`[ORDER SERVICE] Error while parsing bike response:`, error);
    return;
  }

  const manager_db = new OrderManagerDB();

  order = await manager_db.update_bike_status(data.id, data.status);

  handle_order_status(instance, order.id);
}

export async function handle_res_from_hotel(instance: RabbitClient, msg: string) {
  let data: { id: string, status: string };
  let order: OrderDO;
  try {
    data = parse_data_from_response(msg)
  } catch (error) {
    console.error(`[ORDER SERVICE] Error while parsing bike response:`, error);
    return;
  }

  const manager_db = new OrderManagerDB();

  order = await manager_db.update_hotel_status(data.id, data.status);

  handle_order_status(instance, order.id);
}


export async function handle_res_from_payment(instance: RabbitClient, msg: string) {

  console.log(`[ORDER SERVICE] Received Response from payment service:`, msg);
  let data: { id: string, status: string };
  try {
    data = parse_data_from_response(msg)

  } catch (error) {
    console.error(`[ORDER SERVICE] Error while parsing bike response:`, error);
    return;
  }

  const manager_db = new OrderManagerDB();

  let order = await manager_db.get_order(data.id);

  order = await manager_db.update_payment_status(data.id, data.status);
  if (order.payment_status !== 'APPROVED') {
    console.log(`[ORDER SERVICE] Payment failed, reverting bike and hotel orders`);
    instance.sendCanceltoBikeMessageBroker(data.id);
    instance.sendCanceltoHotelMessageBroker(data.id);
    return;
  }

  //APPROVED

  if (order.bike_status === 'APPROVED'
    && order.hotel_status === 'APPROVED'
    && order.payment_status === 'APPROVED') {
    console.log(`[ORDER SERVICE] Order is completed, sending response to frontend`);
    //TODO send response to frontend
    //instance.sendResponseToFrontend(order);
    return;
  }


}
export async function handle_order_status(instance: RabbitClient, order_id: string, retries = 0) {
  const MAX_RETRIES = 5; 
  const TIMEOUT = 10000; 

  try {
    console.log("[ORDER SERVICE] Handling order status for order:", order_id);

    const manager_db = new OrderManagerDB();
    const order: OrderDO | null = await manager_db.get_order(order_id);

    if (!order) {
      console.error(`[ORDER SERVICE] No order found with ID: ${order_id}`);
      return;
    }

    if (order.bike_status === "PENDING" || order.hotel_status === "PENDING") {
      console.log("[ORDER SERVICE] Still waiting for a response from one of the services");

      if (retries < MAX_RETRIES) {
        setTimeout(() => {
          handle_order_status(instance, order_id, retries + 1);
        }, TIMEOUT);
      } else {
        console.log(`[ORDER SERVICE] Max retries reached for order: ${order_id}. Cancelling...`);
        instance.sendCanceltoBikeMessageBroker(order_id);
        instance.sendCanceltoHotelMessageBroker(order_id);
      }
      return;
    }

    if (order.payment_status === "CANCELLED") {
      console.log(`[ORDER SERVICE] Payment service cancelled the request, cancelling bike and hotel...`);
      console.log("[ORDER SERVICE] sending CANCELLED REQUEST to UI...");
      //TODO send responose to UI
      return;
    }

    if (order.bike_status == "CANCELLED" && order.hotel_status == "CANCELLED") {
      console.log(`[ORDER SERVICE] Both services cancelled the request, cancelling order...`);
      await manager_db.update_payment_status(order_id, "CANCELLED");
      //TODO send responose to UI
      return;
    }

    if (order.bike_status === "DENIED") {
      console.log(`[ORDER SERVICE] Bike service denied the request, cancelling hotel...`);
      await manager_db.update_bike_status(order_id, "CANCELLED");
      instance.sendCanceltoHotelMessageBroker(order_id);
    }

    if (order.hotel_status === "DENIED") {
      console.log(`[ORDER SERVICE] Hotel service denied the request, cancelling bike...`);
      await manager_db.update_hotel_status(order_id, "CANCELLED");
      instance.sendCanceltoBikeMessageBroker(order_id);
    }

    if (order.bike_status === "APPROVED" && order.hotel_status === "APPROVED" && order.payment_status === "PENDING") {
      console.log(`[ORDER SERVICE] Order is completed, sending request to payment service`, order);

      const payment_order = {
        id: order.id,
        amount: order.amount,
        created_at: order.created_at,
        updated_at: order.updated_at
      };

      instance.sendToPaymentMessageBroker(JSON.stringify(payment_order));
      console.log("[ORDER SERVICE] Sent order to payment service");
    }

  } catch (error) {
    console.error(`[ORDER SERVICE] Error while handling order status:`, error);
  }
}

