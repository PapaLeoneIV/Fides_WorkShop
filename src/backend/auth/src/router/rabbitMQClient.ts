import client, { Connection, Channel } from "amqplib";
import { rmqUser, rmqPass, rmqhost, LOGIN_QUEUE_REQUEST, LOGIN_QUEUE_RESPONSE, REGISTRATION_QUEUE_RESPONSE, REGISTRATION_QUEUE_REQUEST} from "../rabbitConfig/config";
import { sendNotification } from  "../controller/notification";
import { } from "../controller/handlers";

type HandlerCB = (msg: string, instance?: RabbitClient) => any;

export class RabbitClient {
  connection!: Connection;
  channel!: Channel;
  private connected!: Boolean;

  async connect() {
    if (this.connected && this.channel) return;
    else this.connected = true;

    try {
      console.log(`[AUTH SERVICE] Connecting to Rabbit-MQ Server`);
      this.connection = await client.connect(
        `amqp://${rmqUser}:${rmqPass}@${rmqhost}:5672`
      );

      console.log(`[AUTH SERVICE] Rabbit MQ Connection is ready`);

      this.channel = await this.connection.createChannel();

      console.log(`[AUTH SERVICE] Created RabbitMQ Channel successfully`);
    } catch (error) {
      console.error(error);
      console.error(`[AUTH SERVICE]Not connected to MQ Server`);
    }
  }

  async sendToQueue(queue: string, message: any): Promise<boolean> {
    try {
      if (!this.channel) {
        await this.connect();
      }

      return this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    } catch (error) {
      console.error("[AUTH SERVICE]", error);
      throw error;
    }

  }

  async consume(queue: string, handlerFunc: HandlerCB) {
    await this.channel.assertQueue(queue, {
      durable: true,
    });

    this.channel.consume(
      queue,
      (msg : any) => {
        {
          if (!msg) {
            return console.error(`[AUTH SERVICE]Invalid incoming message`);
          }
          handlerFunc(msg?.content?.toString());
          this.channel.ack(msg);
        }
      },
      {
        noAck: false,
      }
    );
  }

  //----------------------CONSUME-------------------------------
  
    async consumeLoginRequest(handlerFunc: HandlerCB) {
        await this.consume(LOGIN_QUEUE_REQUEST, handlerFunc);
    }

    async consumeRegistrationRequest(handlerFunc: HandlerCB) {
        await this.consume(REGISTRATION_QUEUE_REQUEST, handlerFunc);
    }

  //----------------------SEND----------------------------------
 
    async sendLoginRequest(message: any) {
        await this.sendToQueue(LOGIN_QUEUE_RESPONSE, message);
    }

    async sendRegistrationRequest(message: any) {
        await this.sendToQueue(REGISTRATION_QUEUE_RESPONSE, message);
    }
}

export const rabbitmqClient = new RabbitClient();

