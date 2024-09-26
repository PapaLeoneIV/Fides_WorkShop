import { logger } from "../../../../../logger/logger";
import { OrderState, OrderContext } from "./orderStateLogic";
import { CompletedState } from "./completedState"; 
import { FailedState } from "./failedState"; 

export class WaitingState implements OrderState {
    async handle_request(context: OrderContext, bikes: { road: string, dirt: string}, hotel: {from: Date, to: Date }): Promise<void> {
        console.log('Order is in pending state, processing...');
        try {
            const [bike_response, hotel_response] = await Promise.all([
                await context.sendRequestToBikeShop(bikes),
                await context.sendRequestToHotel(hotel)
            ]);
            if (bike_response === "BIKEAPPROVED" && hotel_response === "HOTELAPPROVED") {
                console.log("approved")
                context.setState(new CompletedState());
                context.processOrder(bikes, hotel)
            } else {
                console.log("denied")
                /*TODO prob will need to differentiate between various FailedStates */
                context.setState(new FailedState());
                context.processOrder(bikes, hotel)
            }
        } catch (error) {
            logger.error("Error in sending order!");
            context.setState(new FailedState());
        }
    }
}
