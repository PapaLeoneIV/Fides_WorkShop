import { bootstrapDBconfig } from "./db";
import { bootstrapRabbitConfig } from "./rabbit";


export async function bootService() {
    await bootstrapDBconfig();
    await bootstrapRabbitConfig();
}
