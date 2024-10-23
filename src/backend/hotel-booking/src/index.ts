import { connectToDatabase } from './db/db';
import { rabbitmqClient } from './models/index';
async function main() {
    connectToDatabase();
    await rabbitmqClient.connect()
    rabbitmqClient.consumeHotelOrder()
    rabbitmqClient.consumecancelHotelOrder()
}

main();

