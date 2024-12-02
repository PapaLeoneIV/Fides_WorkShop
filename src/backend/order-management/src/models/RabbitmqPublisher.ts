import { HTTPErrors } from '../config/HTTPErrors';
import logger from '../config/logger';
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
            logger.error(log.CLIENT.OPERATING(`Publishing message: "${message}" to exchange: ${exchange} with routing key: ${routingKey}`,error).message);
            return false;
        }
    }

    async sendToQueue(queue: string, message: any): Promise<boolean> {
        try {
            if (!this.channel) { await this.connect(); }
            return this.channel.sendToQueue(queue, Buffer.from(message));
        } catch (error) {
            logger.error(log.CLIENT.OPERATING(`Sending message: "${message}" to queue: ${queue}`,error).message);
            return false;
        }
    }
}

export const publisher = new RabbitPublisher();