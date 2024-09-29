import axios from "axios";
//BASE CLASS--------------------------------------------------------------

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
  private bikes: { road: string; dirt: string };
  private hotel: { from: Date; to: Date; room: number };
  private payment_info: {
    orderID: string;
    card: string;
    cvc: string;
    expire_date: string;
    amount: string;
  };

  constructor(
    bikes: { road: string; dirt: string },
    hotel: { from: Date; to: Date; room: number },
    payment_info: {
      orderID: string;
      card: string;
      cvc: string;
      expire_date: string;
      amount: string;
    }
  ) {
    this.bikes = bikes;
    this.hotel = hotel;
    this.payment_info = payment_info;
    this.state = new StartOrderState();
  }

  getState() {
    return this.state;
  }

  setState(state: OrderState) {
    this.state = state;
  }

  /**Each one of the different state will behave differently but all of them
   * will call this method to process the order
   */
  async process_order(
    bikes: { road: string; dirt: string },
    hotel: { from: Date; to: Date; room: number },
    payment_info: {
      orderID: string;
      card: string;
      cvc: string;
      expire_date: string;
      amount: string;
    }
  ) {
    await this.state.handle_request(this, bikes, hotel, payment_info);
  }


  async sendRequestToBikeShop(bikes: {
    road: string;
    dirt: string;
  }): Promise<string> {
    /*TODO implement POST request to bike */
    console.log("sending request to bikeShop!");
    try {
      const response: any = await axios.post(
        "http://localhost:3000/bike_renting/send_data",
        { bikes }
      );
      return response.data;
    } catch (error) {
      console.error("Error sending request:", error);
      throw error;
    }
  }

  async sendRequestToHotel(hotel: {
    from: Date;
    to: Date;
    room: number;
  }): Promise<string> {
    console.log("sending request to hotel service!");
    try {
      const response: any = await axios.post(
        "http://localhost:3001/hotel_booking/send_data",
        { hotel }
      );
      return response.data;
    } catch (error) {
      console.error("Error sending request:", error);
      throw error;
    }
  }

  async sendRequestToMoney(payment_info: {
    orderID: string;
    card: string;
    cvc: string;
    expire_date: string;
    amount: string;
  }): Promise<string> {
    console.log("sending request to money service!");
    try {
      const response: any = await axios.post(
        "http://localhost:3002/payment/send_data",
        { payment_info }
      );
      return response.data;
    } catch (error) {
      console.error("Error sending request:", error);
      throw error;
    }
  }

  async revertBikeOrder(bikes: {
    road: string;
    dirt: string;
  }): Promise<string> {
    console.log("reverting bike order!");
    try {
      const response: any = await axios.post(
        "http://localhost:3000/bike_renting/revert_order",
        {
          bikes,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error sending request:", error);
      throw error;
    }
  }

  async revertHotelOrder(hotel: {
    from: Date;
    to: Date;
    room: number;
  }): Promise<string> {
    console.log("reverting hotel order!");
    try {
      const response: any = await axios.post(
        "http://localhost:3001/hotel_booking/revert_order",
        {
          hotel,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error sending request:", error);
      throw error;
    }
  }

  /*TODO implement the response to UI */
}

interface OrderState {
  handle_request(
    context: order_context,
    bikes: { road: string; dirt: string },
    hotel: { from: Date; to: Date; room: number },
    payment_info: {
      orderID: string;
      card: string;
      cvc: string;
      expire_date: string;
      amount: string;
    }
  ): Promise<void>;
}
//DIFFERENT STATES with different behaviours--------------------------------------
/**This is the inital state of the order, it will forward the request to the dedicated service.
 * If the response is positive, it will change the state to ItemsConfirmedState, otherwise
 * it will change the state to ItemsDeniedState.
 */
class StartOrderState implements OrderState {
  async handle_request(
    context: order_context,
    bikes: { road: string; dirt: string },
    hotel: { from: Date; to: Date; room: number },
    payment_info: {
      orderID: string;
      card: string;
      cvc: string;
      expire_date: string;
      amount: string;
    }
  ): Promise<void> {
    console.log("Order is in pending state, processing...");
    try {
      const [bike_response, hotel_response] = await Promise.all([
        await context.sendRequestToBikeShop(bikes),
        await context.sendRequestToHotel(hotel),
      ]);
      if (
        bike_response === "BIKEAPPROVED" &&
        hotel_response === "HOTELAPPROVED"
      ) {
        context.setState(new ItemsConfirmedState());
        context.process_order(bikes, hotel, payment_info);
      } else {
        const failureInfo = {
          bikeFailed: bike_response !== "BIKEAPPROVED",
          hotelFailed: hotel_response !== "HOTELAPPROVED",
        };
        context.setState(new ItemsDeniedState(failureInfo));
        context.process_order(bikes, hotel, payment_info);
      }
    } catch (error) {
      console.log("Error in sending order!");
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
    bikes: { road: string; dirt: string },
    hotel: { from: Date; to: Date; room: number },
    payment_info: {
      orderID: string;
      card: string;
      cvc: string;
      expire_date: string;
      amount: string;
    }
  ): Promise<void> {
    console.log("Items are confirmed, waiting for payment...");
    try {
      const response = await context.sendRequestToMoney(payment_info);
      if (response === "PAYMENTAPPROVED") {
        context.setState(new PaymentAcceptedState());
        context.process_order(bikes, hotel, payment_info);
      } else {
        context.setState(new PaymentDeniedState());
        context.process_order(bikes, hotel, payment_info);
      }
    } catch (error) {
      console.log("Error in sending order!");
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
    bikes: { road: string; dirt: string },
    hotel: { from: Date; to: Date; room: number },
    payment_info: {
      orderID: string;
      card: string;
      cvc: string;
      expire_date: string;
      amount: string;
    }
  ): Promise<void> {
    if (this.failureInfo.bikeFailed) {
      console.log("Bike failed, reverting hotel order...");
      const response: string = await context.revertHotelOrder(hotel);
      if (response === "HOTELORDERREVERTED") {
        console.log("Reverted hotel order!");
      }
    }
    if (this.failureInfo.hotelFailed) {
      console.log("Hotel failed, reverting bike order...");
      const response: string = await context.revertBikeOrder(bikes);
      if (response === "BIKEORDERREVERTED") {
        console.log("Reverted bike order!");
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
    bikes: { road: string; dirt: string },
    hotel: { from: Date; to: Date; room: number },
    payment_info: {
      orderID: string;
      card: string;
      cvc: string;
      expire_date: string;
      amount: string;
    }
  ): Promise<void> {
    console.log("Payment was succesfull!");
    /*TODO send response to UI */
  }
}

/**We reach this stage when the payment was denied. We will revert the order and send the response to the UI.
 */
class PaymentDeniedState implements OrderState {
  async handle_request(
    context: order_context,
    bikes: { road: string; dirt: string },
    hotel: { from: Date; to: Date; room: number },
    payment_info: {
      orderID: string;
      card: string;
      cvc: string;
      expire_date: string;
      amount: string;
    }
  ): Promise<void> {
    context.setState(
      new ItemsDeniedState({ bikeFailed: true, hotelFailed: true })
    );
    context.process_order(bikes, hotel, payment_info);
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
