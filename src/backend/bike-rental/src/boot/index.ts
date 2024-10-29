import {bootstrapDBconfig} from "./db";
import { bootstrapRabbitConfig } from "./rabbit";

async function bootService() {
    await bootstrapDBconfig();
    await bootstrapRabbitConfig();
}

export default bootService;