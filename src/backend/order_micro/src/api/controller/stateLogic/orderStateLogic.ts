import { logger } from "../../../../../logger/logger"
import { WaitingState } from './waitingState'
import axios from "axios"

export interface OrderState {
    handle_request(context: OrderContext, bikes:{road: string, dirt:string}): Promise<void>;
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

    async processOrder(bikes:{road: string, dirt:string}) {
        await this.state.handle_request(this, bikes)
    }

    async sendRequestToBikeShop(bikes: {road: string, dirt: string}): Promise<string> {
        /*TODO implement POST request to bike */
        console.log("sending request to bikeShop!")
        try {
            const response = await axios.post("http://localhost:3000/bike_renting/send_data", { bikes });
            return response.data; 
        } catch (error) {
            console.error("Error sending request:", error);
            throw error; 
        }
    }


    /**TODO implement the different requests to Money and hotel */
    /**TODO implement the response to UI */

}




