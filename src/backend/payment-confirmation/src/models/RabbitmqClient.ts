import client, { Connection, Channel } from "amqplib";
import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import { Messages as log } from "../config/Messages";
import { RABBITMQ_URL } from "../config/rabbitmq-config";
import IBindingKeysDTO from "../dtos/IBindingKeysDTO";

export class RabbitmqClient {
  bindKeys!: IBindingKeysDTO;
  connection!: Connection;
  channel!: Channel;
  private connected!: Boolean;

  async connect() {
    if (this.connected && this.channel)
      return console.log(log.CLIENT.WARNING.CONNECTING("Already connected to RabbitMQ"));
    else this.connected = true;

    try {
      this.connection = await client.connect(RABBITMQ_URL);
      console.log(log.CLIENT.INFO.CONNECTING("Connected to RabbitMQ"));

      this.channel = await this.connection.createChannel();
      console.log(log.CLIENT.INFO.CONFIGURING("Channel created"));
    } catch (error) {
      console.error(log.CLIENT.ERROR.CONNECTING("RabbitMQ", error));
      throw new Error(HTTPerror.INTERNAL_SERVER_ERROR.message);
    }
  }

  async createQueue(queue: string) {
    try {
      await this.channel.assertQueue(queue, {
        durable: true,
      });
      console.log(log.CLIENT.INFO.CONFIGURING(`Queue ${queue} created`, { queue }));
    } catch (error) {
      console.error(log.CLIENT.ERROR.CONFIGURING(`Queue ${queue}`, error));
      throw new Error(HTTPerror.INTERNAL_SERVER_ERROR.message);
    }
  }

  async requestBindingKeys(url: string): Promise<IBindingKeysDTO> {
    try {
      const response = await fetch(url, { method: "GET" });
      let data = await response.json();
      console.log(log.CLIENT.INFO.FETCHING(`Binding keys from ${url}`, { data }));
      return data as IBindingKeysDTO;
    } catch (error) {
      console.error(log.CLIENT.ERROR.FETCHING(`Binding keys from ${url}`, error));
      throw new Error(HTTPerror.INTERNAL_SERVER_ERROR.message);
    }
  }
}
