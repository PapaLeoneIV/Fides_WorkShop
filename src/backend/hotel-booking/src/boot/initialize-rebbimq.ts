import { Messages as message } from '../config/Messages';
import { publisher } from "../models/RabbitmqPublisher";
import { subscriber } from "../models/RabbitmqSubscriber";
import { QueueNames as queue } from "../config/rabbit-config";

const bikeKeysUrl = "http://config-service:3000/config/hotelKeys";

async function initializeRabbitmqConnection() {

    try {
        // Request binding keys from config service
        console.log(message.BOOT.DEBUG.FETCH_ATTEMPT("Binding keys", "", { url: bikeKeysUrl }).message);
        publisher.bindKeys = await publisher.requestBindingKeys(bikeKeysUrl);
        subscriber.bindKeys = await subscriber.requestBindingKeys(bikeKeysUrl);
        console.log(message.BOOT.INFO.FETCH_SUCCESS("Binding keys", "", { keys: publisher.bindKeys }).message);
    } catch (error) {
        console.error(message.BOOT.ERROR.FETCH_ERROR("Binding keys", "", { error }).message);
        return null; // Or handle this with a fallback structure
    }

    console.log(message.BOOT.DEBUG.CONNECTION_ATTEMPT(`RabbitMQ at url ${process.env.RABBITMQ_URL}`, "", { url: process.env.RABBITMQ_URL }).message);
    try { 
        await publisher.connect(); 
        console.log(message.BOOT.INFO.CONNECTION_SUCCESS(`RabbitMQ Publisher at url ${process.env.RABBITMQ_URL}`, "", { url: process.env.RABBITMQ_URL }).message);
    } catch (error) { 
        console.error(message.BOOT.ERROR.CONNECTION_ERROR(`RabbitMQ Publisher at url ${process.env.RABBITMQ_URL}`, "", { url: process.env.RABBITMQ_URL }).message);
    }

    console.log(message.BOOT.DEBUG.CONNECTION_ATTEMPT(`RabbitMQ at url ${process.env.RABBITMQ_URL}`, "", { url: process.env.RABBITMQ_URL }).message);
    try {
        await subscriber.connect();        
        console.log(message.BOOT.INFO.CONNECTION_SUCCESS(`RabbitMQ Subscriber at url ${process.env.RABBITMQ_URL}`, "", { url: process.env.RABBITMQ_URL }).message);
    } catch (error) {
        console.error(message.BOOT.ERROR.CONNECTION_ERROR(`RabbitMQ Subscriber at url ${process.env.RABBITMQ_URL}`, "", { url: process.env.RABBITMQ_URL }).message);
    }

    await subscriber.createQueue(queue.ORDER_REQUEST);
    await subscriber.createQueue(queue.SAGA_REQUEST);
    console.log(message.BOOT.INFO.QUEUE_CREATED(`Queues ${queue.ORDER_REQUEST} and ${queue.SAGA_REQUEST}`, "", { queues: [queue.ORDER_REQUEST, queue.SAGA_REQUEST] }).message);
}

export default initializeRabbitmqConnection;