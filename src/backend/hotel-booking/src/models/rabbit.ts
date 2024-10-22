import client, { Connection, Channel } from "amqplib";
import { handle_req_from_order_management, handle_cancel_request} from "../controller/handlers";

const rmqUser = process.env.RABBITMQ_USER || "rileone"
const rmqPass = process.env.RABBITMQ_PASSWORD || "password"
const rmqhost = process.env.RABBITMQ_HOST || "rabbitmq"

const REQ_HOTEL_QUEUE = "hotel_request"

const RESP_HOTEL_QUEUE = "hotel_response"

const SAGA_RESP_HOTEL_QUEUE = "saga_hotel_response"

type HandlerCB = (msg: string, instance?: RabbitClient) => any;

class RabbitClient {
  connection!: Connection;
  channel!: Channel;
  private connected!: Boolean;

  async connect() {
    if (this.connected && this.channel) return;
    else this.connected = true;

    try {
      console.log(`[HOTEL SERVICE] Connecting to Rabbit-MQ Server`);
      this.connection = await client.connect(
        `amqp://${rmqUser}:${rmqPass}@${rmqhost}:5672`
      );

      console.log(`[HOTEL SERVICE] Rabbit MQ Connection is ready`);

      this.channel = await this.connection.createChannel();

      console.log(`[HOTEL SERVICE] Created RabbitMQ Channel successfully`);
    } catch (error) {
      console.error(error);
      console.error(`[HOTEL SERVICE]Not connected to MQ Server`);
    }
  }

  async sendToQueue(queue: string, message: any): Promise<boolean> {
    try {
      if (!this.channel) {
        await this.connect();
      }

      return this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    } catch (error) {
      console.error("[HOTEL SERVICE]", error);
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
            return console.error(`[HOTEL SERVICE]Invalid incoming message`);
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
  consumeHotelOrder = async () => {
    console.log("[HOTEL SERVICE] Listening for Hotel orders...");
    this.consume(RESP_HOTEL_QUEUE, (msg) => handle_req_from_order_management(msg));
  };

  //----------------------SEND----------------------------------
  sendToOrderManagementMessageBroker = async (body: string): Promise<void> => {
    this.sendToQueue(REQ_HOTEL_QUEUE, body);
  };

  //----------------------SAGA(CANCEL)--------------------------
  consumecancelHotelOrder = async () => {
    this.consume(SAGA_RESP_HOTEL_QUEUE, (msg) => handle_cancel_request(msg)); 
  }

  

}

export default RabbitClient;