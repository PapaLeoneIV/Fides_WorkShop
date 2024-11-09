import client, { Connection, Channel } from "amqplib";
import { RABBITMQ_URL } from "../config/rabbit-config";
import { IBindingKeysDTO } from "../dtos/IBindingKeysDTO";

export class RabbitmqClient {
  bindKeys!: IBindingKeysDTO;
  connection!: Connection;
  channel!: Channel;
  private connected!: Boolean;

  async connect() {
    if (this.connected && this.channel) return;
    else this.connected = true;

    this.connection = await client.connect(RABBITMQ_URL);
    console.log(`[model] Rabbit MQ Connection is ready`);

    this.channel = await this.connection.createChannel();
    console.log(`[model] Created RabbitMQ Channel successfully`);
  }


  async createQueue(queue: string) {
    await this.channel.assertQueue(queue, {
      durable: true,
    });
  }

  async requestBindingKeys(url: string): Promise<IBindingKeysDTO> {
    const response = await fetch(url, { method: "GET" });
    const data = await response.json();
    return data as IBindingKeysDTO;
  }

  // async setupExchange(exchange: string, exchangeType: string) {

  //   try {
  //     await this.channel.assertExchange(exchange, exchangeType, {
  //       durable: true,
  //     });
  //     console.log(`[model] Event Exchange '${exchange}' declared`);
  //   } catch (error) {
  //     console.error(`[model] Error setting up event exchange:`, error);
  //   }
  // }
}
