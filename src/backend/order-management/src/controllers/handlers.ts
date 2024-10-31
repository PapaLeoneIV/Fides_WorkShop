import { order as OrderEntity } from "@prisma/client";
import { rabbitPub, orderManagerDB } from "../models/index";
import { response_schema, order_info_schema } from "../zodschema/index";
import { DENIED, APPROVED, ERROR, CANCELLED, PENDING } from "../config/status";
import { PaymentOrderDTO } from "../dtos/PaymentOrder.dto";
import { OrderRequestDTO } from "../dtos/OrderRequest.dto";
import { OrderResponseDTO } from "../dtos/OrderResponse.dto";

function order_still_pending(order: OrderEntity): boolean {
  return order.bike_status === PENDING || order.hotel_status === PENDING
}

function order_completed(order: OrderEntity): boolean {
  return order.bike_status === APPROVED && order.hotel_status === APPROVED && order.payment_status === PENDING
}

function order_needs_to_be_cancelled(order: OrderEntity): boolean {
  return order.bike_status === CANCELLED && order.hotel_status === CANCELLED && order.payment_status !== CANCELLED
}

function parse_data_from_response(msg: string) {
  try {
    const data = response_schema.parse(JSON.parse(msg));
    return data;
  }
  catch (error) {
    console.error(`[ORDER SERVICE] Error while parsing response:`, error);
    throw new Error(`[ORDER SERVICE] Error while parsing response: ${error}`);
  }
}

function handle_error_response(resp: OrderResponseDTO): boolean {
  if ((resp.id === "" || resp.id === undefined) && resp.status === ERROR) {
    console.log(`[ORDER SERVICE] Error while processing request, the data sent was not correct`);
    return true;
  }
  return false;
}

function check_approval(order: OrderEntity): boolean {
  return order.bike_status === APPROVED && order.hotel_status === APPROVED && order.payment_status === APPROVED;
}

async function handle_response_general(order: OrderEntity, req_type: "bike" | "hotel"): Promise<boolean> {

  const status = req_type === "bike" ? order.bike_status : order.hotel_status;
  const statusUpdate = req_type === "bike" ? orderManagerDB.update_bike_status : orderManagerDB.update_hotel_status;
  const eventPublish = req_type === "bike" ? rabbitPub.publish_cancel_hotel_orderEvent : rabbitPub.publish_cancel_bike_orderEvent;

  if (status === DENIED) {
    await statusUpdate(order.id, CANCELLED);
    if (order.payment_status === PENDING) {
      console.log(`[ORDER SERVICE] Cancelling payment order...`);
      await orderManagerDB.update_payment_status(order.id, CANCELLED);
    }
    console.log(`[ORDER SERVICE] ${req_type} service denied the request, cancelling hotel...`);
    eventPublish(order.id);
    return true;
  }
  return false;
}

export async function handle_req_from_frontend(msg: string) {
  let data: OrderRequestDTO;
  try {
    data = order_info_schema.parse(JSON.parse(msg));
  } catch (err) {
    console.log("[ORDER SERVICE] Error while parsing frontend request:", err);
    return;
  }
  const order = await orderManagerDB.create_order(data);
  
  rabbitPub.publish_to_bike_orderEvent({
    order_id: order.id,
    road_bike_requested: order.road_bike_requested,
    dirt_bike_requested: order.dirt_bike_requested,
    renting_status: order.bike_status,
    created_at: order.created_at,
    updated_at: order.updated_at
  });
  
  rabbitPub.publish_to_hotel_orderEvent({
    order_id: order.id,
    to: order.to,
    from: order.from,
    room: order.room,
    renting_status: order.hotel_status,
    created_at: order.created_at,
    updated_at: order.updated_at
  });

}


export async function handle_res_from_bike(msg: string) {
  let data: OrderResponseDTO;
  let order: OrderEntity;

  data = parse_data_from_response(msg)

  const error = handle_error_response(data);
  if (error) return;

  order = await orderManagerDB.update_bike_status(data.id, data.status);

  if (await handle_response_general(order, "bike")) return;

  handle_payment_request(order.id);
}

export async function handle_res_from_hotel(msg: string) {
  let data: OrderResponseDTO;
  let order: OrderEntity;

  data = parse_data_from_response(msg)

  const error = handle_error_response(data);
  if (error) return;

  order = await orderManagerDB.update_hotel_status(data.id, data.status);

  if (await handle_response_general(order, "hotel")) return;

  handle_payment_request(order.id);
}

export async function handle_res_from_payment(msg: string) {

  let data: OrderResponseDTO;
  data = parse_data_from_response(msg)

  const error = handle_error_response(data);
  if (error) return;

  let order = await orderManagerDB.get_order(data.id);

  order = await orderManagerDB.update_payment_status(data.id, data.status);

  const paymentApproved = data.status === APPROVED;

  if (!paymentApproved) {
    console.log(`[ORDER SERVICE] Payment failed, reverting bike and hotel orders`);
    rabbitPub.publish_cancel_hotel_orderEvent(data.id);
    rabbitPub.publish_cancel_bike_orderEvent(data.id);
    return;
  }

  const orderApproved = check_approval(order);
  if (orderApproved) {
    console.log(`[ORDER SERVICE] Order is completed, sending response to frontend`);
    return;
  }


}



export async function handle_payment_request(order_id: string, retries = 0) {
  let order: OrderEntity | null;
  let payment_order: PaymentOrderDTO;
  const MAX_RETRIES = 5;
  const TIMEOUT = 10000;
  

  order = await orderManagerDB.get_order(order_id);

  if (!order) {
    //TODO send response to UI
    console.error(`[ORDER SERVICE] No order found with ID: ${order_id}`);
    return;
  }

  if (order_still_pending(order)) {
  
    console.log("[ORDER SERVICE] Still waiting for a response from one of the services");
    if (retries < MAX_RETRIES) {
      setTimeout(() => { handle_payment_request(order_id, retries + 1) }, TIMEOUT);
    } else {
      console.log(`[ORDER SERVICE] Max retries reached for order: ${order_id}. Cancelling...`);
      rabbitPub.publish_cancel_bike_orderEvent(order_id);
      rabbitPub.publish_cancel_hotel_orderEvent(order_id);
    }
    return;
  }
  
  order = await orderManagerDB.update_order(order);

  if (order_needs_to_be_cancelled(order)) {
    //TODO send responose to UI
    console.log(`[ORDER SERVICE] Both services cancelled the request, cancelling order...`);
    console.log("[ORDER SERVICE] sending CANCELLED REQUEST to UI...");
    await orderManagerDB.update_payment_status(order_id, CANCELLED);
    return;
  }

  order = await orderManagerDB.update_order(order);

  if (order_completed(order)) {
    console.log(`[ORDER SERVICE] Order is completed, sending request to payment service`, order);
    payment_order = {
      id: order.id,
      amount: order.amount,
      created_at: order.created_at,
      updated_at: order.updated_at
    };

    rabbitPub.publish_payment_orderEvent(payment_order);
  }


}

