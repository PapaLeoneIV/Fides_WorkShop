import client, { Connection, Channel } from "amqplib";
import { handle_req_from_frontend, handle_res_from_bike, handle_res_from_hotel, handle_res_from_payment } from "../controllers/handlers";

type HandlerCB = (msg: string, instance?: RabbitClient) => any;

const rmqUser = process.env.RABBITMQ_USER || "rileone"
const rmqPass = process.env.RABBITMQ_PASSWORD || "password"
const rmqhost = process.env.RABBITMQ_HOST || "rabbitmq"

const REQ_BIKE_QUEUE = "bike_request"
const REQ_HOTEL_QUEUE = "hotel_request"
const REQ_PAYMENT_QUEUE = "payment_request"
const REQ_BOOKING_QUEUE = "booking_request"

const RESP_BIKE_QUEUE = "bike_response"
const RESP_HOTEL_QUEUE = "hotel_response"
const RESP_PAYMENT_QUEUE = "payment_response"
const RESP_BOOKING_QUEUE = "booking_response"

const SAGA_RESP_BIKE_QUEUE = "saga_bike_response"
const SAGA_RESP_HOTEL_QUEUE = "saga_hotel_response"

class RabbitClient {
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

  async sendToQueue(queue: string, message: any): Promise<boolean> {
    try {
      if (!this.channel) {
        await this.connect();
      }

      return this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    } catch (error) {
      console.error("[ORDER SERVICE]", error);
      throw error;
    }

  }

  async consume(queue: string, handlerFunc: HandlerCB) {
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
          handlerFunc(msg?.content?.toString());
          this.channel.ack(msg);
        }
      },
      {
        noAck: false,
      }
    );
  }
//---------------------------CONSUME--------------------------
  consumeBookingOrder = async () => {
    console.log("[ORDER SERVICE] Listening for booking orders...");
    this.consume(REQ_BOOKING_QUEUE, (msg) => handle_req_from_frontend(msg));
  };

  consumeBikeResponse = async () => {
    console.log("[ORDER SERVICE] Listening for bike responses...");
    this.consume(REQ_BIKE_QUEUE, (msg) => handle_res_from_bike(msg));
  };

  consumeHotelResponse = async () => {
    console.log("[ORDER SERVICE] Listening for hotel responses...");
    this.consume(REQ_HOTEL_QUEUE, (msg) => handle_res_from_hotel(msg));
  };

  consumePaymentResponse = async () => {
    console.log("[ORDER SERVICE] Listening for payment responses...");
    this.consume(REQ_PAYMENT_QUEUE, (msg) => handle_res_from_payment(msg));
  };

//---------------------------SEND------------------------------
  sendToBikeMessageBroker = async (body: string): Promise<void> => {
    this.sendToQueue(RESP_BIKE_QUEUE, body);
  };

  sendToHotelMessageBroker = async (body: string): Promise<void> => {
      this.sendToQueue(RESP_HOTEL_QUEUE, body);
  };

  sendToPaymentMessageBroker = async (body: string): Promise<void> => {
    this.sendToQueue(RESP_PAYMENT_QUEUE, body);
  };

//---------------------------SAGA(REVERSE ORDER)---------------

  sendCanceltoBikeMessageBroker = async (body: string): Promise<void> => {
   this.sendToQueue(SAGA_RESP_BIKE_QUEUE, body);
  }

  sendCanceltoHotelMessageBroker = async (body: string): Promise<void> => {
    this.sendToQueue(SAGA_RESP_HOTEL_QUEUE, body);
  }

}

export default RabbitClient;