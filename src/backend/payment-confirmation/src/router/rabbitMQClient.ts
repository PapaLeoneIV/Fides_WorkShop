import client, { Connection, Channel } from "amqplib";
import { sendNotification } from "../controllers/notification";
import { handle_req_from_order_management } from "../controllers/handlers";
import { rmqUser, rmqPass, rmqhost, } from "../rabbitConfig/config";
import { REQ_PAYMENT_QUEUE, RESP_PAYMENT_QUEUE } from "../rabbitConfig/config";

type HandlerCB = (msg: string, instance?: RabbitClient) => any;

export class RabbitClient {
  connection!: Connection;
  channel!: Channel;
  private connected!: Boolean;

  async connect() {
    if (this.connected && this.channel) return;
    else this.connected = true;

    try {
      console.log(`[PAYMENT SERVICE] Connecting to Rabbit-MQ Server`);
      this.connection = await client.connect(
        `amqp://${rmqUser}:${rmqPass}@${rmqhost}:5672`
      );

      console.log(`[PAYMENT SERVICE] Rabbit MQ Connection is ready`);

      this.channel = await this.connection.createChannel();

      console.log(`[PAYMENT SERVICE] Created RabbitMQ Channel successfully`);
    } catch (error) {
      console.error(error);
      console.error(`[PAYMENT SERVICE]Not connected to MQ Server`);
    }
  }

  async sendToQueue(queue: string, message: any): Promise<boolean> {
    try {
      if (!this.channel) {
        await this.connect();
      }

      return this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    } catch (error) {
      console.error("[PAYMENT SERVICE]", error);
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
            return console.error(`[PAYMENT SERVICE]Invalid incoming message`);
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
  consumePaymentgOrder = async () => {
    console.log("[PAYMENT SERVICE] Listening for booking orders...");
    this.consume(RESP_PAYMENT_QUEUE, (msg) => handle_req_from_order_management(this, msg));
  };

  //----------------------SEND----------------------------------
  
  sendToOrderMessageBroker = async (body: string): Promise<void> => {
    const newNotification = {
      title: "Bike order incoming",
      description: body,
    };
    sendNotification(newNotification, REQ_PAYMENT_QUEUE);
  };

  //----------------------SAGA(CANCEL)--------------------------

}

export const rabbitmqClient = new RabbitClient();

