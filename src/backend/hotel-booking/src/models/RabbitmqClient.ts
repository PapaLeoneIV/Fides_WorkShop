import logger from '../config/logger';
import log from "../config/logs";
import client, { Connection, Channel } from "amqplib";
import IBindingKeysDTO from "../dtos/IBindingKeysDTO";
import { RABBITMQ_URL } from "../config/rabbit-config";

export class RabbitmqClient {
  bindKeys!:  IBindingKeysDTO;
  connection!: Connection;
  channel!: Channel;
  private connected!: Boolean;

  async connect() {
    if (this.connected && this.channel) return;
    else this.connected = true;
    this.connection = await client.connect(RABBITMQ_URL);
    this.channel = await this.connection.createChannel();
  }

  async createQueue(queue: string) {
    await this.channel.assertQueue(queue, {
      durable: true,
    });
  }
  
  async requestBindingKeys(url: string): Promise<IBindingKeysDTO> {
    const response = await fetch(url, {method: "GET"});
    const data = await response.json();
    return data as IBindingKeysDTO;
  }

  // async setupExchange(exchange: string, exchangeType: string) {

  //   try {
  //     // Declare a fanout exchange
  //     await this.channel.assertExchange(exchange, exchangeType, {
  //       durable: true,
  //     });
  //     logger.info(`[ORDER SERVICE] Event Exchange '${exchange}' declared`);
  //   } catch (error) {
  //     logger.error(`[ORDER SERVICE] Error setting up event exchange:`, error);
  //   }
  // }
}

