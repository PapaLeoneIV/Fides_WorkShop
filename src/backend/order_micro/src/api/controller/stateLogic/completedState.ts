import { logger } from "../../../../../logger/logger"
import {OrderState, OrderContext} from "orderStateLogic"

export class CompletedState implements OrderState {
    async handle_request(context: OrderContext): Promise<void> {
        logger.info('Order is completed!');
        /*TODO send response to UI */
    }
}