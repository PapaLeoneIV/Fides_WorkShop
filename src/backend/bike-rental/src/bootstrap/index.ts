import {bootstrapDBconfig} from "./database";
import { bootstrapRabbitConfig } from "./rabbitmq";

async function bootService() {
    await bootstrapDBconfig();
    await bootstrapRabbitConfig();
}

export default bootService;