import { rabbitSub, rabbitPub } from "../models";
import { LOGIN_QUEUE_REQUEST, REGISTRATION_QUEUE_REQUEST, /* USER_INFO_QUEUE */} from "../config/rabbit";

const bikeKeysUrl = "http://config-service:3000/config/authKeys";


export async function bootstrapRabbitConfig() {


    rabbitPub.bindKeys = await rabbitPub.requestBindingKeys(bikeKeysUrl);
    rabbitSub.bindKeys = await rabbitSub.requestBindingKeys(bikeKeysUrl);
    
    console.log("[BIKE SERVICE] PUB Connecting to RabbitMQ...");
    await rabbitPub.connect();
    console.log("[BIKE SERVICE] SUB Connecting to RabbitMQ...");

    await rabbitSub.connect();
    console.log("[BIKE SERVICE] Connected to RabbitMQ");

    console.log("[BIKE SERVICE] Setting up queues");
    await rabbitSub.createQueue(LOGIN_QUEUE_REQUEST);
    await rabbitSub.createQueue(REGISTRATION_QUEUE_REQUEST);
    // await rabbitSub.createQueue(USER_INFO_QUEUE);
}