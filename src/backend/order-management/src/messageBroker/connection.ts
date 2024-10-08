import client, { Connection, Channel, ConsumeMessage } from "amqplib";
import { rmqUser, rmqPass, rmqhost } from "./config"

type HandlerCB = (msg: string) => any;

class RabbitMQConnection {
  connection!: Connection;
  channel!: Channel;
  private connected!: Boolean;

  async connect() {
    if (this.connected && this.channel) return;
    else this.connected = true;

    try {
      console.log(`[ORDER SERVICE] Connecting to Rabbit-MQ Server`);
            this.connection = await client.connect(
        `amqp://${rmqUser}:${rmqPass}@${rmqhost}:5672`
      );

      console.log(`[ORDER SERVICE] Rabbit MQ Connection is ready`);

      this.channel = await this.connection.createChannel();

      console.log(`[ORDER SERVICE] Created RabbitMQ Channel successfully`);
    } catch (error) {
      console.error(error);
      console.error(`[ORDER SERVICE]Not connected to MQ Server`);
    }
  }

  async sendToQueue(queue: string, message: any) : Promise<boolean> {
    try {
      if (!this.channel) {
        await this.connect();
      }

     return  this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    } catch (error) {
      console.error("[ORDER SERVICE]", error);
      throw error;
    }
  }

  async consume(queue: string, handle_req_from_frontend: HandlerCB) {

    await this.channel.assertQueue(queue, {
      durable: true,
    });

    this.channel.consume(
      queue,
      (msg) => {
        {
          if (!msg) {
            return console.error(`Invalid incoming message`);
          }
          handle_req_from_frontend(msg?.content?.toString());
          this.channel.ack(msg);
        }
      },
      {
        noAck: false,
      }
    );
  }
}

const mqConnection = new RabbitMQConnection();

export default mqConnection;