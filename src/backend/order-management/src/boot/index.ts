import {bootstrapRabbitConfig} from "./rabbitmq";   
import { bootstrapDBconfig } from "./db";


async function bootService() {
    
    await bootstrapDBconfig();

    await bootstrapRabbitConfig();
}


export default bootService;