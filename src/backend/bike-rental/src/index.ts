import { connectToDatabase } from './db/db';
import { bootstrapRabbitConfig, rabbitSub } from './models';

async function main() {
    await connectToDatabase();
    await bootstrapRabbitConfig();

    


    rabbitSub.consumeBikeOrder();
    rabbitSub.consumecancelBikeOrder();
}

main();


