import { logger } from "../../../../../logger/logger"
import {OrderState, OrderContext} from "orderStateLogic"
import { CompletedState } from "completedState"
import { FailedState } from "failedState"


export class WaitingState implements OrderState {
    async handle_request(context: OrderContext): Promise<void> {
        logger.info('Order is in pending state, processing...')
        try {
            const [bike_response] = await Promise.all([
                context.sendRequestToBikeShop()
                /* context.sendRequestToBikeShop
                context.sendRequestToBikeShop */
            ])
            if (bike_response === "BIKEAPPROVED") { context.setState(new CompletedState()); }
            else { context.setState(new WaitingState()); }
        } catch (error) {
            logger.error("Error in sending order!")
            context.setState(new FailedState());
        }
    }
}