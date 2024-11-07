import bootService from "./boot";
import {rabbitSub} from "./models/index";
import app from "./boot/router/router";
async function main() {

   await bootService();

   //CONSUME
   rabbitSub.consumeBookingOrder();
   // rabbitSub.consumeUserInfoResponse();
   rabbitSub.consumeBikeResponse();
   rabbitSub.consumeHotelResponse();
   rabbitSub.consumePaymentResponse();

   //CONSUME SAGA
   rabbitSub.consumeHotelSagaResponse();
   rabbitSub.consumeBikeSagaResponse();

   app.listen(3000, () => {
      console.log("Server is running on port 3000");
   });
}

main();


