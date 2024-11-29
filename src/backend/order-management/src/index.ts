import bootService from "./boot";
import {rabbitSub} from "./models/index";
import app from "./router/router";
async function main() {

   const port = 3000;
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

   app.listen(port, () => {
      console.log("Server is running on port :", port);
   });
}

main();


