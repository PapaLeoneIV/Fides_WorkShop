//MAIN CLASS---------------------------------------------------------------------
export class order_context {
  private state: OrderState;
  private bikes: { road: string; dirt: string };
  private hotel: { from: Date; to: Date; room: number };
  //private card: string;

  constructor(
    bikes: { road: string; dirt: string },
    hotel: { from: Date; to: Date; room: number }
  ) {
    this.bikes = bikes;
    this.hotel = hotel;
    this.state = new WaitingState();
  }

  getState() {
    return this.state;
  }

  setState(state: OrderState) {
    this.state = state;
  }

  async process_order(
    bikes: { road: string; dirt: string },
    hotel: { from: Date; to: Date; room: number }
  ) {
    await this.state.handle_request(this, bikes, hotel);
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

  /*TODO implement the different requests to Money*/
  /*TODO implement the response to UI */
}

interface OrderState {
  handle_request(
    context: order_context,
    bikes: { road: string; dirt: string },
    hotel: { from: Date; to: Date; room: number }
  ): Promise<void>;
}
//DIFFERENT STATES with different behaviours--------------------------------------
class WaitingState implements OrderState {
    async handle_request(
      context: order_context,
      bikes: { road: string; dirt: string },
      hotel: { from: Date; to: Date; room: number }
    ): Promise<void> {
      console.log("Order is in pending state, processing...");
      try {
        const [bike_response, hotel_response] = await Promise.all([
          await context.sendRequestToBikeShop(bikes),
          await context.sendRequestToHotel(hotel),
        ]);
        try {
        } catch (error) {}
        if (
          bike_response === "BIKEAPPROVED" &&
          hotel_response === "HOTELAPPROVED"
        ) {
          console.log("approved");
          context.setState(new CompletedState());
          context.process_order(bikes, hotel);
        } else {
          console.log("denied");
          /*TODO prob will need to differentiate between various FailedStates (BIG MAYBE) */
          context.setState(new FailedState());
          context.process_order(bikes, hotel);
        }
      } catch (error) {
        console.log("Error in sending order!");
        context.setState(new FailedState());
      }
    }
}
  
class CompletedState implements OrderState {
  async handle_request(context: order_context): Promise<void> {
    console.log("Order is completed!");
    /*TODO send response to UI */
  }
}

/*TODO I need to understand if it will be better to split the failedState in various organs
 * so that each failed state will have its routine to rollback the changes
 */
class FailedState implements OrderState {
  async handle_request(context: order_context): Promise<void> {
    console.log("Order was not succesfull!");
    /*TODO roll back database */
    /*TODO send response to UI */
  }
}
//END OF STATES------------------------------------------------------------------