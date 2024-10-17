import { connectToDatabase } from './db/db';
import { rabbitmqClient } from "./router/rabbitMQClient";

async function main() {
    connectToDatabase();
    await rabbitmqClient.connect()
    rabbitmqClient.consumeHotelOrder()
    rabbitmqClient.consumecancelHotelOrder()
}

main();

