import axios from "axios";
//MAIN CLASS---------------------------------------------------------------------
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
  //private card: string;

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
        "http://localhost:3002/payment/send_payment",
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
    console.log("reverting bike order!");
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

  /*TODO implement the different requests to Money*/
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
    if (!this.failureInfo.bikeFailed) {
      const response: string = await context.revertHotelOrder(hotel);
      if (response === "HOTELORDERREVERTED") {
        console.log("Reverted hotel order!");
      }
    }
    if (!this.failureInfo.hotelFailed) {
      const response: string = await context.revertBikeOrder(bikes);
      if (response === "BIKEORDERREVERTED") {
        console.log("Reverted bike order!");
      }
      /*TODO respond to UI */
    }
  }
}

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
