import declareExchange from "../creating_exchange/index.js";
import bindQueueWithExchange from "../bind_queue_with_exchange/index.js";
import {QUEUE_OPTIONS} from "../constants";
import ampq from "amqplib"

const sendMessageToQueueWithDirectExchange = async (channel : ampq.Channel, message: string) => {
    try {
        const exchangeName = 'my_direct_exchange';
        const queueName = 'my_direct_queue'

        // Declare the direct exchange
        await declareExchange(channel, 'direct', exchangeName)
        await bindQueueWithExchange(channel, queueName, exchangeName, QUEUE_OPTIONS)

        // Publish the message to the direct exchange with the routing key
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify({content: message})));
        console.log(`Message sent to exchange '${exchangeName} and ${queueName}' : ${message}`);
    } catch (error) {
        console.error('Error setting up direct exchange:', error);
    }
}

export default sendMessageToQueueWithDirectExchange;