
import { connectToDatabase } from './db/db';
import { bootstrapRabbitConfig, rabbitSub } from './models/index';


async function main() {
    await connectToDatabase();
    await bootstrapRabbitConfig(); 

    rabbitSub.consumePaymentgOrder();
}

main();

