import { logger } from "../../../../../logger/logger";
import { OrderState, OrderContext } from "./orderStateLogic";
import { CompletedState } from "./completedState"; 
import { FailedState } from "./failedState"; 

export class WaitingState implements OrderState {
    async handle_request(context: OrderContext, bikes: { road: string, dirt: string }): Promise<void> {
        console.log('Order is in pending state, processing...');
        try {
            const [bike_response] = await Promise.all([
                await context.sendRequestToBikeShop(bikes)
            ]);
            if (bike_response === "BIKEAPPROVED") {
                console.log("approved")
                context.setState(new CompletedState());
                context.processOrder(bikes)
            } else {
                console.log("denied") 
                context.setState(new FailedState());
                context.processOrder(bikes)
            }
        } catch (error) {
            logger.error("Error in sending order!");
            context.setState(new FailedState());
        }
    }
}
