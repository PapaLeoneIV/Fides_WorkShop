import {QUEUE_OPTIONS} from "../constants";
import ampq from "amqplib"

const declareExchange = async (channel: ampq.Channel, exchangeType: string, exchangeName: string) => {
    try {
        await channel.assertExchange(exchangeName, exchangeType, QUEUE_OPTIONS);
        console.log(`${exchangeName} exchange declared....`);
    } catch (error) {
        console.error(`Error declaring ${exchangeName} exchange:`, error);
    }
}

export default declareExchange