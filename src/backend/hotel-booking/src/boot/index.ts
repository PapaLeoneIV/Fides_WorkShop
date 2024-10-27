import connectToDatabase from "./db";
import bootstrapRabbitConfig from "./rabbit";

async function bootService() {
    await connectToDatabase();
    await bootstrapRabbitConfig();
}

export default bootService;