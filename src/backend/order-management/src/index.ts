import { connectToDatabase } from './db/db';
import { rabbitmqClient } from './models/index';

async function main() {

   connectToDatabase();
   //BOOTSTRAP RABBITMQ
   await rabbitmqClient.connect();
   await rabbitmqClient.setupEventExchange("OrderEventExchange", "fanout");
   await rabbitmqClient.setupEventExchange("BookingEventExchange", "fanout");


   //PUBLISH
   rabbitmqClient.publishEvent("OrderEventExchange", "OrderCreated", {id: "123", status: "PENDING"});
   rabbitmqClient.publishEvent("BookingEventExchange", "BookingCreated", {id: "123", status: "PENDING"});

   //CONSUME
   rabbitmqClient.consumeBookingOrder();
   rabbitmqClient.consumeBikeResponse();
   rabbitmqClient.consumeHotelResponse();
   rabbitmqClient.consumePaymentResponse();

}

main();


