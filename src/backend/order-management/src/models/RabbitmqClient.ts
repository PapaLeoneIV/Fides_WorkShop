import client, { Connection, Channel } from "amqplib";
import logger from '../config/logger';
import log  from '../config/logs';
import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import { RABBITMQ_URL } from "../config/rabbit-config";
import { IBindingKeysDTO } from "../dtos/IBindingKeysDTO";

export class RabbitClient {
  bindKeys!: IBindingKeysDTO;
  connection!: Connection;
  channel!: Channel;
  private connected!: Boolean;

  async connect() {
    if (this.connected && this.channel) 
      return logger.info(log.CLIENT.CONNECTING(`Already connected to RabbitMQ`, { url: RABBITMQ_URL }));
    else this.connected = true;

    try {
      
      this.connection = await client.connect(RABBITMQ_URL);

      this.channel = await this.connection.createChannel();
      logger.info(log.CLIENT.CONNECTING(`RabbitMQ`, { url: RABBITMQ_URL }));
    } catch (error) {
      logger.error(log.CLIENT.CONNECTING(`RabbitMQ`, { error }));
      throw new Error(HTTPerror.INTERNAL_SERVER_ERROR.message);
    }
  }

  async setupExchange(exchange: string, exchangeType: string) {
    try {
      // Declare a fanout exchange
      await this.channel.assertExchange(exchange, exchangeType, {
        durable: true,
      });
      logger.info(log.CLIENT.CONFIGURING(`Rabbitmq Exchange`, exchange));
    } catch (error) {
      logger.error(log.CLIENT.CONFIGURING(`Rabbitmq Exchange`, { error }));
      throw new Error(HTTPerror.INTERNAL_SERVER_ERROR.message);
    }
  }

  async createQueue(queue: string) {
    try {
      await this.channel.assertQueue(queue, {
        durable: true,
      });
      logger.info(log.CLIENT.CONFIGURING(`Rabbitmq Queue`, queue));
    } catch (error) {
      logger.error(log.CLIENT.CONFIGURING(`Rabbitmq Queue`, { error }));
      throw new Error(HTTPerror.INTERNAL_SERVER_ERROR.message);
    }
  }

  async requestBindingKeys(url: string): Promise<IBindingKeysDTO> {
    try {
      let response = await fetch(url, { method: "GET" });
      logger.info(log.CLIENT.FETCHING("Binding keys", url));
      return await response.json();
    } catch (error) {
      logger.error(log.CLIENT.FETCHING("Binding keys", { error }));
      throw new Error(HTTPerror.INTERNAL_SERVER_ERROR.message);
    }
  }
}
