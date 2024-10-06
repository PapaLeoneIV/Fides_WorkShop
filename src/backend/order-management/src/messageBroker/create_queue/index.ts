import connectToRabbitMQ from '../config.js';
import {QUEUE_OPTIONS} from "../constants.js";

const createQueue = async (queueName : string) => {

    try {
        const {connection, channel} = await connectToRabbitMQ();
        await channel.assertQueue(queueName, QUEUE_OPTIONS);
        console.log('Queue created successfully.');

        return {connection,channel}
    } catch (error) {
        console.error('Error creating queue:', error);
    }
}

export default createQueue