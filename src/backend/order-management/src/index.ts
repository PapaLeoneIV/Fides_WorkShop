import { connectToDatabase } from './db/db';
import { rabbitmqClient } from './models/index';
const port = 3003;

async function main() {

   connectToDatabase();
   await rabbitmqClient.connect();

   rabbitmqClient.consumeBookingOrder();
   rabbitmqClient.consumeBikeResponse();
   rabbitmqClient.consumeHotelResponse();
   rabbitmqClient.consumePaymentResponse();

}

main();


