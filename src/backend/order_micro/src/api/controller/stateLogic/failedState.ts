import { logger } from "../../../../../logger/logger"
import {OrderState, OrderContext} from "orderStateLogic"

export class FailedState implements OrderState {
    async handle_request(context: OrderContext): Promise<void> {
        logger.info('Order was not succesfull!');
        /*TODO send response to UI */
    }
}