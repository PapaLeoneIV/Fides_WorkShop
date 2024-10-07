import axios from "axios";
import { sendToBikeMessageBroker, sendToHotelMessageBroker, sendToPaymentMessageBroker } from "../../messageBroker";
import { PrismaClient } from "@prisma/client";

const bikeQueue = "bike_request_queue"

const prisma = new PrismaClient();
//BASE CLASS--------------------------------------------------------------
export interface order_info {
  id: string;
  from: string;
  to: string;
  room: string;
  amount: string;
  road_bike_requested: string;
  dirt_bike_requested: string;
  order_status: string;
  created_at: Date;
  updated_at: Date;
}

interface OrderState {
  handle_request(context: order_context, info: order_info): Promise<void>;
}
class OrderManagerDB {

  async create_order(info: order_info): Promise<order_info> {
    const x = await prisma.order.create({
      data: {
        from: info.from,
        to: info.to,
        room: info.room,
        road_bike_requested: info.road_bike_requested,
        dirt_bike_requested: info.dirt_bike_requested,
        amount: info.amount,
        order_status: "PENDING",
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    console.log('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]Order created with id : ", x.id);
    return x;
  }

  async check_existance(id: string): Promise<boolean> {
    console.log('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]Checking if order exists with id: ", id);
    const order = await prisma.order.findFirst({
      where: {
        id: id,
      },
    });
    if (!order) {
      console.log(`Order with id ${id} not found`);
      return false;
    }
    return true;
  }

  async update_status(id: string, status: string): Promise<void> {
    console.log('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]", "Updating order status with status: ", status);
    await prisma.order.update({
      where: {
        id: id,
      },
      data: {
        order_status: status,
      },
    });
    return;
  }

  async update_order(info: order_info): Promise<void> {
    console.log('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]", "Updating order with id: ", info.id);
    await prisma.order.update({
      where: {
        id: info.id,
      },
      data: {
        to: info.to,
        from: info.from,
        room: info.room,

        road_bike_requested: info.road_bike_requested,
        dirt_bike_requested: info.dirt_bike_requested,

        amount: info.amount,

        order_status: "PENDING",
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    return;
  }
}
/**I develop this class following the STATE PATTERN DESIGN, where each state has
 * a set of different behaviours. The main idea is to have a context that will
 * change its state depending on the response of the different services. The context
 * will handle the request and will call the different services to process the order.
 * In doing so i tried to mix this STATE pattern with the SAGA PATTERN , where we have
 * a pipeline of services that will be called one after the other. If one of the services
 * fails, we will revert the order and send the response to the UI.
 */

export class order_context {
  private state: OrderState;
  public manager_db: OrderManagerDB;
  public order: order_info;

  constructor(info: order_info) {
    this.manager_db = new OrderManagerDB();
    this.state = new StartOrderState();
    this.order = info;
  }

  getState() {
    return this.state;
  }

  setState(state: OrderState) {
    this.state = state;
  }

  async process_order(order: order_info) {
    await this.state.handle_request(this, order);
  }

  async sendRequestToBikeShopHTTP(
    order: order_info,
  ): Promise<string> {
    /*TODO implement POST request to bike */
    console.log('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]", "Sending request to bikeShop!");
    try {
      const bikes = {
        order_id: order.id,
        road_bike_requested: order.road_bike_requested,
        dirt_bike_requested: order.dirt_bike_requested,
      };
      const response: any = await axios.post(
        "http://localhost:3000/bike_renting/send_data",
        bikes
      );
      return response.data;
    } catch (error) {
      console.error('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]", "Error sending request:", error);
      throw error;
    }
  }

  async sendRequestToHotelHTTP(
    order: order_info,
  ): Promise<string> {
    console.log('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]", "Sending request to hotel service!");
    try {
      const hotel = {
        order_id: order.id,
        from: order.from,
        to: order.to,
        room: order.room,
      };
      const response: any = await axios.post(
        "http://localhost:3001/hotel_booking/send_data",
        hotel
      );
      return response.data;
    } catch (error) {
      console.error('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]", "Error sending request:", error);
      throw error;
    }
  }

  async sendRequestToMoneyHTTP(order: order_info): Promise<string> {
    console.log('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]", "Sending request to money service!");
    try {
      const payment_info = {
        order_id: order.id,
        amount: order.amount,
      };
      const response: any = await axios.post(
        "http://localhost:3002/payment/send_data",
        payment_info
      );
      return response.data;
    } catch (error) {
      console.error('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]", "Error sending request:", error);
      throw error;
    }
  }


  /*TODO modify it so that revert endpoint will only accept the orderid */
  async revertBikeOrderHTTP(
    order_id: string,
  ): Promise<string> {
    console.log('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]", "Reverting bike order");
    try {
      const bikes = {
        order_id: order_id,
      };
      const response: any = await axios.post(
        "http://localhost:3000/bike_renting/revert_order",
        bikes,
      );
      return response.data;
    } catch (error) {
      console.error('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]", "Error sending request:", error);
      throw error;
    }
  }

  async revertHotelOrderHTTP(
    order_id: string,
  ): Promise<string> {
    console.log('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]", "Reverting hotel order!");
    try {
      const hotel = {
        order_id: order_id,
      };
      const response: any = await axios.post(
        "http://localhost:3001/hotel_booking/revert_order",
        hotel,
      );
      return response.data;
    } catch (error) {
      console.error('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]", "Error sending request:", error);
      throw error;
    }
  }



  async sendRequestToBikeShopMessageBroker(
    order: Buffer,
  ): Promise<void> {
    console.log('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]", "Sending request to bikeShop through Message Broker!");
    try {
      sendToBikeMessageBroker(order)
    } catch (error) {
      console.error('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]", "Error sending request:", error);
      throw error;
    }
  }

  async sendRequestToHotelShopMessageBroker(
    order: Buffer,
  ): Promise<void> {
    console.log('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]", "Sending request to hotel through Message Broker!");
    try {
      sendToHotelMessageBroker(order)
    } catch (error) {
      console.error('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]", "Error sending request:", error);
      throw error;
    }
  }

  



  /*TODO implement the response to UI */
}

//DIFFERENT STATES with different behaviours--------------------------------------

/**This is the inital state of the order, it will forward the request to the dedicated service.
 * If the response is positive, it will change the state to ItemsConfirmedState, otherwise
 * it will change the state to ItemsDeniedState.
 */



class StartOrderState implements OrderState {
  async handle_request(
    context: order_context,
  ): Promise<void> {
    console.log('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]", "Starting to process the order with id ", context.order.id);

    try {
      const bikeMessage = Buffer.from(JSON.stringify({
        order_id: context.order.id,
        road_bike_requested: context.order.road_bike_requested,
        dirt_bike_requested: context.order.dirt_bike_requested,
      }))

      const HotelMessage = Buffer.from(JSON.stringify({
        order_id: context.order.id,
        to: context.order.to,
        from: context.order.from,
        room: context.order.room
      }))

      context.sendRequestToBikeShopMessageBroker(bikeMessage)
      console.log("[ORDER MANAGER] Sent order to bike service via RabbitMQ");
      context.sendRequestToHotelShopMessageBroker(HotelMessage)
      console.log("[ORDER MANAGER] Sent order to hotel service via RabbitMQ")
    } catch (error) {
      console.log('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]", "Error processing order:", error);
      context.setState(new ErrorState());
    }








    try {
      const [bike_response, hotel_response] = await Promise.all([
        context.sendRequestToBikeShopHTTP(context.order),
        context.sendRequestToHotelHTTP(context.order),
      ]);
      if (
        bike_response === "BIKEAPPROVED" &&
        hotel_response === "HOTELAPPROVED"
      ) {
        context.manager_db.update_status(context.order.id, "ITEMS_CONFIRMED");
        context.setState(new ItemsConfirmedState());
        context.process_order(context.order);
      } else {
        const failureInfo = {
          bikeFailed: bike_response !== "BIKEAPPROVED",
          hotelFailed: hotel_response !== "HOTELAPPROVED",
        };
        context.manager_db.update_status(context.order.id, "ITEMS_DENIED");
        context.setState(new ItemsDeniedState(failureInfo));
        context.process_order(context.order);
      }
    } catch (error) {
      console.log('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]", "Error in sending order!");
      context.setState(new ErrorState());
    }
  }
}

/**We reach this stage when, all the requested items were fulfilled, and we only need to
 * contact the payment service to process the payment. If the payment is approved, we will
 * change the state to PaymentAcceptedState, otherwise we will change the state to PaymentDeniedState.
 */
class ItemsConfirmedState implements OrderState {
  async handle_request(
    context: order_context,
    order: order_info
  ): Promise<void> {
    console.log('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]", "Items are confirmed, waiting for payment...");
    try {
      const response = await context.sendRequestToMoneyHTTP(context.order);
      if (response === "PAYMENTAPPROVED") {
        context.manager_db.update_status(order.id, "PAYMENT_APPROVED");
        context.setState(new PaymentAcceptedState());
        context.process_order(context.order);
      } else {
        context.manager_db.update_status(order.id, "PAYMENT_DENIED");
        context.setState(new PaymentDeniedState());
        context.process_order(context.order);
      }
    } catch (error) {
      console.log('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]", "Error in sending order!");
      context.setState(new ErrorState());
    }
  }
}

/**We reach this state, when one of the items requested were not available. Once we know this, we can perform
 * the necessary actions to revert the order that was already processed. We will change the state to ItemsDeniedState
 * and we will process the order again.
 */
class ItemsDeniedState implements OrderState {
  private failureInfo: { bikeFailed: boolean; hotelFailed: boolean };

  constructor(failureInfo: { bikeFailed: boolean; hotelFailed: boolean }) {
    this.failureInfo = failureInfo;
  }

  async handle_request(
    context: order_context,
    order: order_info
  ): Promise<void> {
    if (this.failureInfo.bikeFailed) {
      const response: string = await context.revertHotelOrderHTTP(order.id);
      if (response === "HOTELORDERREVERTED") {
        console.log('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]", "Hotel order with id ", order.id, "reverted!");
      }
    }
    if (this.failureInfo.hotelFailed) {
      const response: string = await context.revertBikeOrderHTTP(order.id);
      if (response === "BIKEORDERREVERTED") {
        context.manager_db.update_status(order.id, "REVERTED");
        console.log('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]", "Hotel order with id ", order.id, "reverted!");
      }
      /*TODO respond to UI */
    }
  }
}

/**We reach this stage when everything down the pipeline went well, the only thing left is
 * to send the response to the UI.
 */

class PaymentAcceptedState implements OrderState {
  async handle_request(
    context: order_context,
    info: order_info
  ): Promise<void> {
    console.log('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]", "Payment was succesfull!");
    /*TODO send response to UI */
  }
}

/**We reach this stage when the payment was denied. We will revert the order and send the response to the UI.
 */
class PaymentDeniedState implements OrderState {
  async handle_request(
    context: order_context,
    info: order_info
  ): Promise<void> {
    context.setState(
      new ItemsDeniedState({ bikeFailed: true, hotelFailed: true })
    );
    context.process_order(info);
    /*TODO respond to UI */
  }
}

class ErrorState implements OrderState {
  async handle_request(context: order_context): Promise<void> {
    console.log("Order was not succesfull!");
    /*TODO roll back database */
    /*TODO send response to UI */
  }
}
//END OF STATES------------------------------------------------------------------
