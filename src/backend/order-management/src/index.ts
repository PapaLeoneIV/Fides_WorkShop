import { connectToDatabase } from './db/db';
import { rabbitPub, rabbitSub } from './models/index';

async function main() {

   connectToDatabase();

   

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


