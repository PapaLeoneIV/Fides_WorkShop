import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import logger from './config/logger';
import log  from "../config/logs";
import { RabbitmqClient } from "./RabbitmqClient";

class RabbitmqPublisher extends RabbitmqClient {
  constructor() {
    super();
  }

  async publishEvent(exchange: string, routingKey: string, message: any): Promise<boolean> {
    try {
      if (!this.channel) {
        await this.connect();
      }
      console.log(log.CLIENT.INFO.OPERATING("RabbitMQ", "", { exchange, routingKey, message }));
      return this.channel.publish(
        exchange,
        routingKey, // No routing key needed for fanout
        Buffer.from(message),
        {
          //TODO se necessario continuare  a customizzare il channel
          appId: "PaymentService",
        }
      );
    } catch (error) {
      console.error(log.CLIENT.ERROR.OPERATING("RabbitMQ", "", { error }));
      throw new Error(HTTPerror.INTERNAL_SERVER_ERROR.message);
    }
  }

  async sendToQueue(queue: string, message: any): Promise<boolean> {
    try {
      if (!this.channel) {
        await this.connect();
      }

      return this.channel.sendToQueue(queue, Buffer.from(message));
    } catch (error) {
      console.error("[ORDER SERVICE]", error);
      throw error;
    }
  }
}

export const publisher = new RabbitmqPublisher();
