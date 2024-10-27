import {bootstrapRabbitConfig} from "./rabbitmq";   
import { connectToDatabase } from "./db";


async function bootService() {
    
    await connectToDatabase();

    await bootstrapRabbitConfig();
}


export default bootService;