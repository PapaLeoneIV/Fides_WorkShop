import { connectToDatabase } from './db/db';
import { rabbitmqClient } from './models';

async function main() {
    connectToDatabase();
    await rabbitmqClient.connect();
    rabbitmqClient.consumeBikeOrder();
    rabbitmqClient.consumecancelBikeOrder();
}

main();


