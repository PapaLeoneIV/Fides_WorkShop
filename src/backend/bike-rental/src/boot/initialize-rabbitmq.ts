import { publisher } from "../models/RabbitmqPublisher"
import { subscriber } from "../models/RabbitmqSubscriber";
import { QueueNames as queue} from "../config/rabbit-config";

const bikeKeysUrl = "http://config-service:3000/config/bikeKeys";

async function initializeRabbitmqConnection() {

    // Request binding keys from config service
    try {
        console.log(`[model] Requesting binding keys from: ${bikeKeysUrl}`);
        publisher.bindKeys = await publisher.requestBindingKeys(bikeKeysUrl);
        console.log(`[model] Binding keys received: ${JSON.stringify(publisher.bindKeys)}`);
        subscriber.bindKeys = await subscriber.requestBindingKeys(bikeKeysUrl);
    } catch (error) {
        console.error(`[error] Failed to fetch binding keys: ${error}`);
        return null; // Or handle this with a fallback structure
    }
    
    
    // Connect publisher to RabbitMQ
    try {
        console.log("[boot] Connecting publisher to RabbitMQ...");
        await publisher.connect();
        console.log("[boot] Publisher connected to RabbitMQ");
    } catch (error) {
        console.error(error);
        console.error(`[boot] Publisher not connected to MQ Server`);
    }

    // Connect subscriber to RabbitMQ
    try {
        console.log("[boot] Connecting subscriber to RabbitMQ...");
        await subscriber.connect();
        console.log("[boot] Subscriber connected to RabbitMQ");
    } catch (error) {
        console.error(error);
        console.error(`[boot] Subscriber not connected to MQ Server`);
    }

    // Setup queues
    console.log("[boot] Setting up queues");
    await subscriber.createQueue(queue.ORDER_REQUEST);
    await subscriber.createQueue(queue.SAGA_REQUEST);
}

export default initializeRabbitmqConnection;