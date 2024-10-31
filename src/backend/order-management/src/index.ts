import bootService from "./boot";
import {rabbitSub} from "./models/index";

async function main() {

   await bootService();

   //CONSUME
   rabbitSub.consumeBookingOrder();
   rabbitSub.consumeBikeResponse();
   rabbitSub.consumeHotelResponse();
   rabbitSub.consumePaymentResponse();

   //CONSUME SAGA
   rabbitSub.consumeHotelSagaResponse();
   rabbitSub.consumeBikeSagaResponse();
}

main();


