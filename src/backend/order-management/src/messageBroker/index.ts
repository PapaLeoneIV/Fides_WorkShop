import mqConnection from "./connection";
import { sendNotification } from "./notification";
import { BIKE_QUEUE, HOTEL_QUEUE, PAYMENT_QUEUE, BOOKING_QUEUE } from "./config";
import { OrderManagerDB } from "../api/service/orderService";
import { order_info } from "../api/service/orderService";


  export const consumeBookingOrder = async () => {

    await mqConnection.connect();

    mqConnection.consume(BOOKING_QUEUE, handle_req_from_frontend);

  }

  export const consumeBikeResponse = async () => {


    mqConnection.consume(BIKE_QUEUE, handle_res_from_bike);

  }

  export const consumeHotelResponse = async () => {
    console.log("[ORDER SERVICE] Listening for hotel responses...");
    
    mqConnection.consume(HOTEL_QUEUE, handle_res_from_hotel);
  };

  export const consumePaymentResponse = async () => {


    mqConnection.consume(PAYMENT_QUEUE, handle_res_from_payment);

  }

  export const sendToBikeMessageBroker = async (body: string): Promise<void> => {
    await mqConnection.connect();

    const newNotification = {
      title: "Bike order incoming",
      description: body,
    };
    sendNotification(newNotification, BIKE_QUEUE);
  };

  export const sendToHotelMessageBroker = async (body: string): Promise<void> => {
    await mqConnection.connect();

    const newNotification = {
      title: "Hotel order incoming",
      description: body,
    };
    sendNotification(newNotification, HOTEL_QUEUE)
  };


  export const sendToPaymentMessageBroker = async (body: string): Promise<void> => {
    await mqConnection.connect();

    const newNotification = {
      title: "Payment order incoming",
      description: body,
    };
    sendNotification(newNotification, PAYMENT_QUEUE);
  };

  export const handle_req_from_frontend = async (msg: string) => {
    try {
      console.log(`[ORDER SERVICE]Received Request from frontend`, msg);

      /*TODO quando mando l informazione dal frontend al backend mi devo ricordare che deve essere identica a order_info */
      const order_info: order_info = JSON.parse(msg);

      const manager_db = new OrderManagerDB();
      manager_db.create_order(order_info);

      sendToBikeMessageBroker(msg);
      sendToHotelMessageBroker(msg);
    } catch (error) {
      console.error(`Error While Parsing the message`);
    }
  };

  export const handle_res_from_bike = async (msg: string) => {
    console.log(`[ORDER SERVICE]Received Response from bike service`, msg);

    const response = JSON.parse(msg);
    const manager_db = new OrderManagerDB();
    manager_db.update_bike_status(response.id, response.status);
    handle_order_status(response.id);
  };

  export const handle_res_from_hotel = async (msg: string) => {
    console.log(`[ORDER SERVICE]Received Response from hotel service`, msg);

    const response = JSON.parse(msg);
    const manager_db = new OrderManagerDB();
    manager_db.update_hotel_status(response.id, response.status);
    handle_order_status(response.id);
  };

  export const handle_res_from_payment = async (msg: string) => {
    console.log(`[ORDER SERVICE]Received Response from payment service`, msg);

    const response = JSON.parse(msg);
    const manager_db = new OrderManagerDB();
    manager_db.update_payment_status(response.id, response.status);
    /*TODO i need to handle the case where the payment response was negative, i need to revert the bike and hotel order*/
  };

  const handle_order_status = async (order_id: string) => {
    const manager_db = new OrderManagerDB();
    const order = await manager_db.get_order(order_id);
    if (order && order.bike_status === "COMPLETED" && order.hotel_status === "COMPLETED") {
      console.log(`[ORDER SERVICE]Order is completed, sending request to payment service`, order);  
      await sendToPaymentMessageBroker(JSON.stringify(order));
    }
  }
