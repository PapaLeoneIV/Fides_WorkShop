import {OrderState, order_context} from "orderStateLogic"

export class CompletedState implements OrderState {
    async handle_request(context: order_context): Promise<void> {
        console.log('Order is completed!');
        /*TODO send response to UI */
    }
}