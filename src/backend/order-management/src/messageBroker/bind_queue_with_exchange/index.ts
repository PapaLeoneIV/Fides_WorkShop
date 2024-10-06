import {QUEUE_OPTIONS} from "../constants";
import ampq from "amqplib"
const bindQueueWithExchange = async (channel : ampq.Channel, queueName: string, exchangeName: string, queueOptions=QUEUE_OPTIONS) => {
    try {
        await channel.assertQueue(queueName, queueOptions);
        await channel.bindQueue(queueName, exchangeName, '');
        console.log('Queue declared and bound to exchange:', queueName);
    } catch (error) {
        console.error('Error declaring and binding queue:', error);
    }
}

export default bindQueueWithExchange