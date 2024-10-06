import consumer from "../message_consumer/index.js";
import ampq from "amqplib"

const consumeMessageFromQueueWithDirectExchange = async (channel: ampq.Channel) => {
    try {
        const exchangeName = 'my_direct_exchange';
        const queueName = 'my_direct_queue'

        await consumer(queueName, channel, exchangeName)
    } catch (error) {
        console.error('Error consuming message:', error);
    }
}

export default consumeMessageFromQueueWithDirectExchange