import { HTTPErrors } from '../config/HTTPErrors';
import logger from './config/logger';
import log  from '../config/logs';
import { RabbitClient } from './RabbitmqClient';

class RabbitPublisher extends RabbitClient {
    constructor() {
        super();
    }

    // publish_event = async (exchange: string, routingKey: string, message: any): Promise<void> => {
    //     this.publishEvent(exchange, routingKey, message);
    // }

    async publishEvent(exchange: string, routingKey: string, message: any): Promise<boolean> {
        try {
            if (!this.channel) { await this.connect(); }
            return this.channel.publish(
                exchange,
                routingKey, // No routing key needed for fanout
                Buffer.from(JSON.stringify(message)), {
                    appId: "OrderService",
                }
            );
        } catch (error) {
            console.error(log.CLIENT.ERROR.OPERATING(`Publishing message: "${message}" to exchange: ${exchange} with routing key: ${routingKey}`, "", error).message);
            throw new Error(HTTPErrors.INTERNAL_SERVER_ERROR.message);
        }
    }

    async sendToQueue(queue: string, message: any): Promise<boolean> {
        try {
            if (!this.channel) { await this.connect(); }
            return this.channel.sendToQueue(queue, Buffer.from(message));
        } catch (error) {
            console.error(log.CLIENT.ERROR.OPERATING(`Sending message: "${message}" to queue: ${queue}`, "", error).message);
            throw new Error(HTTPErrors.INTERNAL_SERVER_ERROR.message);
        }
    }
}

export const publisher = new RabbitPublisher();