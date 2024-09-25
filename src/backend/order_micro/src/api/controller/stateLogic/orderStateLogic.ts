import { logger } from "../../../../../logger/logger"
import { WaitingState } from "waitingState"

export interface OrderState {
    handle_request(context: OrderContext): Promise<void>;
}



export class OrderContext {
    private state: OrderState;
    private bikes: {road: string, dirt: string};
    //private card: string;
    //private hotel: {from: string, to: string};
    
    constructor(bikes: {road: string, dirt: string}) {
        this.bikes = bikes;
        this.state = new WaitingState()
    }

    getState(){
        return this.state;
    }

    setState(state: OrderState) {
        this.state = state;
    }

    async processOrder() {
        await this.state.handle_request(this)
    }

    async sendRequestToBikeShop(bikes: {road: string, dirt: string}): Promise<string> {
        /*TODO implement POST request to bike */
        return new Promise(resolve => setTimeout(() => resolve('BIKEAPPROVED'), 1000));
    }


    /**TODO implement the different requests to Money and hotel */
    /**TODO implement the response to UI */

}




