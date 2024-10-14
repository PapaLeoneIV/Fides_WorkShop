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
  try {
    data = parse_data_from_response(msg)
  } catch (error) {
    console.error(`[ORDER SERVICE] Error while parsing bike response:`, error);
    return;
  }

  const manager_db = new OrderManagerDB();

  await manager_db.update_bike_status(data.id, data.status);

  if (data.status === "APPROVED") await handle_order_status(instance, data.id);
  else if (data.status === "DENIED") instance.sendCanceltoHotelMessageBroker(data.id);
  else if (data.status === "CANCELLED") await manager_db.update_hotel_status(data.id, "CANCELLED");  // TODO repsond to UI
}

export async function handle_res_from_hotel(instance: RabbitClient, msg: string) {
  let data: { id: string, status: string };
  try {
    data = parse_data_from_response(msg)
  } catch (error) {
    console.error(`[ORDER SERVICE] Error while parsing bike response:`, error);
    return;
  }

  const manager_db = new OrderManagerDB();
  manager_db.update_hotel_status(data.id, data.status);

  if (data.status === "APPROVED") await handle_order_status(instance, data.id);
  else if (data.status === "DENIED") instance.sendCanceltoBikeMessageBroker(data.id);
  else if (data.status === "CANCELLED") await manager_db.update_bike_status(data.id, "CANCELLED"); // TODO repsond to UI
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

export async function handle_order_status(instance: RabbitClient, order_id: string) {
  try {
    console.log("HANDLE ORDER STATUS FOR PAYMENT")
    const manager_db = new OrderManagerDB();

    const order: OrderDO | null = await manager_db.get_order(order_id);

    if (order && order.bike_status === "APPROVED" && order.hotel_status === "APPROVED") {
      console.log(`[ORDER SERVICE] Order is completed, sending request to payment service`, order);

      const payment_order = {
        id: order.id,
        amount: order.amount,
        created_at: order.created_at,
        updated_at: order.updated_at
      };

      instance.sendToPaymentMessageBroker(JSON.stringify(payment_order));
    }
    else
    {
     /*  setTimeout(() => {
        console.log("[ORDER SERVICE]")
      }, 5000) */
    }
    return; //order is not completed yet
  } catch (error) {
    console.error(`[ORDER SERVICE] Error while checking order status:`, error);
  }
}
