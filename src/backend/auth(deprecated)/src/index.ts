import { bootstrapDBconfig } from './db/db';
import { rabbitmqClient } from './models/index';

async function main(){
    bootstrapDBconfig();
    await rabbitmqClient.connect();
    await rabbitmqClient.consumeLoginRequest();
    await rabbitmqClient.consumeRegistrationRequest();

}



main();