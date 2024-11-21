import client, { Connection, Channel } from "amqplib";
import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import { Messages as log } from '../config/Messages';
import { RABBITMQ_URL } from "../config/rabbit-config";
import { IBindingKeysDTO } from "../dtos/IBindingKeysDTO";

export class RabbitClient {
  bindKeys!: IBindingKeysDTO;
  connection!: Connection;
  channel!: Channel;
  private connected!: Boolean;

  async connect() {
    if (this.connected && this.channel) 
      return console.log(log.CLIENT.WARNING.CONNECTING(`Already connected to RabbitMQ`));
    else this.connected = true;

    try {
      
      this.connection = await client.connect(RABBITMQ_URL);

      this.channel = await this.connection.createChannel();
      console.log(log.CLIENT.INFO.CONNECTING(`RabbitMQ`));
    } catch (error) {
      console.error(log.CLIENT.ERROR.CONNECTING(`RabbitMQ`, { error }));
      throw new Error(HTTPerror.INTERNAL_SERVER_ERROR.message);
    }
  }

  async setupExchange(exchange: string, exchangeType: string) {
    try {
      // Declare a fanout exchange
      await this.channel.assertExchange(exchange, exchangeType, {
        durable: true,
      });
      console.log(log.CLIENT.INFO.CONFIGURING(`Rabbitmq Exchange`, exchange));
    } catch (error) {
      console.error(log.CLIENT.ERROR.CONFIGURING(`Rabbitmq Exchange`, { error }));
      throw new Error(HTTPerror.INTERNAL_SERVER_ERROR.message);
    }
  }

  async createQueue(queue: string) {
    try {
      await this.channel.assertQueue(queue, {
        durable: true,
      });
      console.log(log.CLIENT.INFO.CONFIGURING(`Rabbitmq Queue`, queue));
    } catch (error) {
      console.error(log.CLIENT.ERROR.CONFIGURING(`Rabbitmq Queue`, { error }));
      throw new Error(HTTPerror.INTERNAL_SERVER_ERROR.message);
    }
  }

  async requestBindingKeys(url: string): Promise<IBindingKeysDTO> {
    try {
      let response = await fetch(url, { method: "GET" });
      console.log(log.CLIENT.INFO.FETCHING("Binding keys", url));
      return await response.json();
    } catch (error) {
      console.error(log.CLIENT.ERROR.FETCHING("Binding keys", { error }));
      throw new Error(HTTPerror.INTERNAL_SERVER_ERROR.message);
    }
  }
}
