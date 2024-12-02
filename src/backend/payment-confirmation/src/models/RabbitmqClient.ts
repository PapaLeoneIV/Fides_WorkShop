import client, { Connection, Channel } from "amqplib";
import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import logger from '../config/logger';
import log  from "../config/logs";
import { RABBITMQ_URL } from "../config/rabbitmq-config";
import IBindingKeysDTO from "../dtos/IBindingKeysDTO";

export class RabbitmqClient {
  bindKeys!: IBindingKeysDTO;
  connection!: Connection;
  channel!: Channel;
  private connected!: Boolean;

  async connect() {
    if (this.connected && this.channel)
      return logger.info(log.CLIENT.CONNECTING("Already connected to RabbitMQ"));
    else this.connected = true;

    try {
      this.connection = await client.connect(RABBITMQ_URL);
      logger.info(log.CLIENT.CONNECTING("Connected to RabbitMQ"));

      this.channel = await this.connection.createChannel();
      logger.info(log.CLIENT.CONFIGURING("Channel created"));
    } catch (error) {
      logger.error(log.CLIENT.CONNECTING("RabbitMQ", error));
      throw new Error(HTTPerror.INTERNAL_SERVER_ERROR.message);
    }
  }

  async createQueue(queue: string) {
    try {
      await this.channel.assertQueue(queue, {
        durable: true,
      });
      logger.info(log.CLIENT.CONFIGURING(`Queue ${queue} created`, { queue }));
    } catch (error) {
      logger.error(log.CLIENT.CONFIGURING(`Queue ${queue}`, error));
      throw new Error(HTTPerror.INTERNAL_SERVER_ERROR.message);
    }
  }

  async requestBindingKeys(url: string): Promise<IBindingKeysDTO> {
    try {
      const response = await fetch(url, { method: "GET" });
      let data = await response.json();
      logger.info(log.CLIENT.FETCHING(`Binding keys from ${url}`, { data }));
      return data as IBindingKeysDTO;
    } catch (error) {
      logger.error(log.CLIENT.FETCHING(`Binding keys from ${url}`, error));
      throw new Error(HTTPerror.INTERNAL_SERVER_ERROR.message);
    }
  }
}
