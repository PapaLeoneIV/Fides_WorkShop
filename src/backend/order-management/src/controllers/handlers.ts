import { order as OrderEntity } from "@prisma/client";
import { rabbitPub, orderManagerDB } from "../models/index";
import { response_schema, order_info_schema } from "../zodschema/index";
import { DENIED, APPROVED, ERROR, CANCELLED, PENDING } from "../config/status";
import { BikeOrderDTO } from "../dtos/BikeOrder.dto";
import { HotelOrderDTO } from "../dtos/HotelOrder.dto";
import { PaymentOrderDTO } from "../dtos/PaymentOrder.dto";
import { OrderRequestDTO } from "../dtos/OrderRequest.dto";
import { OrderResponseDTO } from "../dtos/OrderResponse.dto";


function parse_data_from_response(msg: string) {
  return response_schema.parse(JSON.parse(msg));
}


export async function handle_req_from_frontend(msg: string) {
  let data: OrderRequestDTO;
  try {
    const parsedMsg = JSON.parse(msg);
    parsedMsg.created_at = new Date(parsedMsg.created_at);
    parsedMsg.updated_at = new Date(parsedMsg.updated_at);
    data = order_info_schema.parse(parsedMsg);
  } catch (err) {
    console.log("[ORDER SERVICE] Error while parsing frontend request:", err);
    return;
  }
  
  const order = await orderManagerDB.create_order(data);

  const bike_order : BikeOrderDTO = {
    order_id: order.id,
    road_bike_requested: order.road_bike_requested,
    dirt_bike_requested: order.dirt_bike_requested,
    renting_status: order.bike_status,
    created_at: order.created_at,
    updated_at: order.updated_at
  };

  const hotel_order : HotelOrderDTO = {
    order_id: order.id,
    to: order.to,
    from: order.from,
    room: order.room,
    renting_status: order.hotel_status,
    created_at: order.created_at,
    updated_at: order.updated_at
  };


  
  rabbitPub.publish_to_bike_orderEvent(bike_order);
  rabbitPub.publish_to_hotel_orderEvent(hotel_order);

}

export async function handle_res_from_bike(msg: string) {
  let data: OrderResponseDTO;
  let order: OrderEntity;
  try {
    data = parse_data_from_response(msg)
  } catch (error) {
    console.error(`[ORDER SERVICE] Error while parsing bike response:`, error);
    return;
  }

  if ((data.id === "" || data.id === undefined) && data.status === ERROR) {
    console.log(`[ORDER SERVICE] Error while processing bike request, the data sent was not correct`);
    return
  }


  order = await orderManagerDB.update_bike_status(data.id, data.status);


  if (order.bike_status === DENIED) {
    if (order.payment_status === PENDING) {
      console.log(`[ORDER SERVICE] Cancelling payment order...`);
      await orderManagerDB.update_payment_status(order.id, CANCELLED);
    }
    console.log(`[ORDER SERVICE] Bike service denied the request, cancelling hotel...`);
    await orderManagerDB.update_bike_status(order.id, CANCELLED);
    rabbitPub.publish_cancel_hotel_orderEvent(order.id);
    return;
  }


  handle_order_status(order.id);
}

export async function handle_res_from_hotel(msg: string) {
  let data: OrderResponseDTO;
  let order: OrderEntity;
  try {
    data = parse_data_from_response(msg)
  } catch (error) {
    console.error(`[ORDER SERVICE] Error while parsing bike response:`, error);
    return;
  }

  if ((data.id === "" || data.id === undefined) && data.status === ERROR) {
    console.log(`[ORDER SERVICE] Error while processing hotel request, the data sent was not correct`);
    return
  }

  order = await orderManagerDB.update_hotel_status(data.id, data.status);

  if (order.hotel_status === DENIED) {
    console.log(`[ORDER SERVICE] Hotel service denied the request, cancelling bike...`);
    await orderManagerDB.update_hotel_status(order.id, CANCELLED);
    if (order.payment_status === PENDING) {
      console.log(`[ORDER SERVICE] Cancelling payment order...`);
      await orderManagerDB.update_payment_status(order.id, CANCELLED);
    }
    rabbitPub.publish_cancel_bike_orderEvent(order.id);
    return;
  }



  handle_order_status(order.id);

}

export async function handle_res_from_payment(msg: string) {

  console.log(`[ORDER SERVICE] Received Response from payment service:`, msg);
  let data: OrderResponseDTO;
  try {
    data = parse_data_from_response(msg)
  } catch (error) {
    console.error(`[ORDER SERVICE] Error while parsing bike response:`, error);
    return;
  }

  let order = await orderManagerDB.get_order(data.id);

  order = await orderManagerDB.update_payment_status(data.id, data.status);
  if (order.payment_status !== APPROVED) {
    console.log(`[ORDER SERVICE] Payment failed, reverting bike and hotel orders`);
    rabbitPub.publish_cancel_hotel_orderEvent(data.id);
    rabbitPub.publish_cancel_bike_orderEvent(data.id);
    return;
  }

  //APPROVED

  if (order.bike_status === APPROVED
    && order.hotel_status === APPROVED
    && order.payment_status === APPROVED) {
    console.log(`[ORDER SERVICE] Order is completed, sending response to frontend`);
    //TODO send response to frontend
    return;
  }


}

export async function handle_order_status(order_id: string, retries = 0) {
  const MAX_RETRIES = 5;
  const TIMEOUT = 10000;



  try {
    console.log("[ORDER SERVICE] Handling order status for order:", order_id);

    let order: OrderEntity | null;
    let payment_order: PaymentOrderDTO;
    
    order = await orderManagerDB.get_order(order_id);

    if (!order) {
      console.error(`[ORDER SERVICE] No order found with ID: ${order_id}`);
      //TODO send response to UI
      return;
    }

    if (order.bike_status === PENDING || order.hotel_status === PENDING) {
      console.log("[ORDER SERVICE] Still waiting for a response from one of the services");

      if (retries < MAX_RETRIES) {
        setTimeout(() => {
          handle_order_status(order_id, retries + 1);
        }, TIMEOUT);
      } else {
        console.log(`[ORDER SERVICE] Max retries reached for order: ${order_id}. Cancelling...`);
        rabbitPub.publish_cancel_bike_orderEvent(order_id);
        rabbitPub.publish_cancel_hotel_orderEvent(order_id);
      }
      return;
    }

    if (order.bike_status == CANCELLED && order.hotel_status == CANCELLED && order.payment_status !== CANCELLED) {
      console.log(`[ORDER SERVICE] Both services cancelled the request, cancelling order...`);
      await orderManagerDB.update_payment_status(order_id, CANCELLED);
      console.log("[ORDER SERVICE] sending CANCELLED REQUEST to UI...");
      //TODO send responose to UI
      return;
    }





    if (order.bike_status === APPROVED && order.hotel_status === APPROVED && order.payment_status === PENDING) {
      console.log(`[ORDER SERVICE] Order is completed, sending request to payment service`, order);

      payment_order = {
        id: order.id,
        amount: order.amount,
        created_at: order.created_at,
        updated_at: order.updated_at
      };

      rabbitPub.publish_payment_orderEvent(payment_order);
      console.log("[ORDER SERVICE] Sent order to payment service");
    }

  } catch (error) {
    console.error(`[ORDER SERVICE] Error while handling order status:`, error);
  }
}

