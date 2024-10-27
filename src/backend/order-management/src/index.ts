import { connectToDatabase } from './db/db';
import { bootstrapRabbitConfig, rabbitSub } from './models/index';

async function main() {

   await connectToDatabase();

   await bootstrapRabbitConfig();

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


