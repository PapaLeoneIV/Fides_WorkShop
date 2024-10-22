import { connectToDatabase } from './db/db';
import { rabbitmqClient } from './models/index';

async function main(){
    connectToDatabase();
    await rabbitmqClient.connect();
    await rabbitmqClient.consumeLoginRequest();
    await rabbitmqClient.consumeRegistrationRequest();

}



main();