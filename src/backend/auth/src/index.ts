import { connectToDatabase } from './db/db';
import { rabbitmqClient } from './router/rabbitMQClient';
async function main(){
    connectToDatabase();
    await rabbitmqClient.consumeLoginRequest();
    await rabbitmqClient.consumeRegistrationRequest();

}



main();