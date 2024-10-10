import client, { Connection, Channel } from "amqplib";
import { rmqUser, rmqPass, rmqhost, REQ_BIKE_QUEUE, REQ_BOOKING_QUEUE, REQ_HOTEL_QUEUE, REQ_PAYMENT_QUEUE, RESP_BIKE_QUEUE, RESP_HOTEL_QUEUE, RESP_PAYMENT_QUEUE } from "./config"
import { sendNotification } from "./notification";
import { handle_req_from_frontend, handle_res_from_bike, handle_res_from_hotel, handle_res_from_payment } from "./handlers";

type HandlerCB = (msg: string, instance?: RabbitMQConnection) => any;

export class RabbitMQConnection {
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

  consumeBookingOrder = async () => {
    console.log("[ORDER SERVICE] Listening for booking orders...");
    this.consume(REQ_BOOKING_QUEUE, (msg) => handle_req_from_frontend(this, msg));
  };

  consumeBikeResponse = async () => {
    console.log("[ORDER SERVICE] Listening for bike responses...");
    this.consume(REQ_BIKE_QUEUE, (msg) => handle_res_from_bike(this, msg));
  };

  consumeHotelResponse = async () => {
    console.log("[ORDER SERVICE] Listening for hotel responses...");
    this.consume(REQ_HOTEL_QUEUE, (msg) => handle_res_from_hotel(this, msg));
  };

  consumePaymentResponse = async () => {
    console.log("[ORDER SERVICE] Listening for payment responses...");
    this.consume(REQ_PAYMENT_QUEUE, (msg) => handle_res_from_payment(this, msg));
  };


  sendToBikeMessageBroker = async (body: string): Promise<void> => {
    const newNotification = {
      title: "Bike order incoming",
      description: body,
    };
    sendNotification(newNotification, RESP_BIKE_QUEUE);
  };

  sendToHotelMessageBroker = async (body: string): Promise<void> => {
    const newNotification = {
      title: "Hotel order incoming",
      description: body,
    };
    sendNotification(newNotification, RESP_HOTEL_QUEUE)
  };

  sendToPaymentMessageBroker = async (body: string): Promise<void> => {
    const newNotification = {
      title: "Payment order incoming",
      description: body,
    };
    sendNotification(newNotification, RESP_PAYMENT_QUEUE);
  };

}

export const rabbitmqClient = new RabbitMQConnection();

