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
  async setupExchange(exchange: string, exchangeType: string) {

    try {
      // Declare a fanout exchange
      await this.channel.assertExchange(exchange, exchangeType, {
        durable: true,
      });
      console.log(`[ORDER SERVICE] Event Exchange '${exchange}' declared`);
    } catch (error) {
      console.error(`[ORDER SERVICE] Error setting up event exchange:`, error);
    }
  }
  async publishEvent(exchange: string, routingKey: string,  message: any): Promise<boolean> {

    try {
      if (!this.channel) {
        await this.connect();
      }

      return this.channel.publish(
        exchange,
        routingKey, // No routing key needed for fanout
        Buffer.from(JSON.stringify(message)),
        {
          //TODO se necessario continuare a customizzare il channel
          appId: "OrderService",
        }
      );
    } catch (error) {
      console.error("[ORDER SERVICE] Error publishing event:", error);
      throw error;
    }
  }
  async sendToQueue(queue: string, message: any): Promise<boolean> {
    try {
      if (!this.channel) {
        await this.connect();
      }

      return this.channel.sendToQueue(queue, Buffer.from(message));
    } catch (error) {
      console.error("[ORDER SERVICE]", error);
      throw error;
    }

  }

  async createQueue(queue: string) {
    await this.channel.assertQueue(queue, {
      durable: true,
    });
  }
  async consume(queue: string,exchange: string, bindingKey: string,   handlerFunc: HandlerCB) {

    this.channel.bindQueue(queue, exchange, bindingKey);

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
 

}

class RabbitPublisher extends RabbitClient {
  constructor() {
    super();
  }

  //OrderExchange
  sendToBikeMessageBroker = async (body: string): Promise<void> => {
    console.log(`[ORDER SERVICE] Sending to Bike Service: ${body}`);
    const bindingKey = "RKbike_request";
    this.publishEvent("OrderEventExchange", bindingKey, body);
  };
  //OrderExchange
  sendToHotelMessageBroker = async (body: string): Promise<void> => {
    console.log(`[ORDER SERVICE] Sending to Hotel Service: ${body}`);
    const bindingKey = "RKhotel_request";
    this.publishEvent("OrderEventExchange", bindingKey, body);
  };
  //OrderExchange
  sendToPaymentMessageBroker = async (body: string): Promise<void> => {
    console.log(`[ORDER SERVICE] Sending to Payment Service: ${body}`);
    const bindingKey = "RKpayment_request";
    this.publishEvent("OrderEventExchange", bindingKey , body);
  };

  //---------------------------SAGA(REVERSE ORDER)---------------
  //SAGAExchange
    sendCanceltoBikeMessageBroker = async (body: string): Promise<void> => {
      const bindingKey = "RKbike_SAGA_request";
      this.publishEvent("OrderEventExchange", bindingKey , body);
    }
  
  //SAGAExchange
  sendCanceltoHotelMessageBroker = async (body: string): Promise<void> => {
    const bindingKey = "RKhotel_SAGA_request";
    this.publishEvent("OrderEventExchange", bindingKey, body);
  }
}

class RabbitSubscriber extends RabbitClient {
  constructor() {
    super();
  }

   //---------------------------CONSUME--------------------------
   consumeBookingOrder = async () => {
    console.log("[ORDER SERVICE] Listening for booking orders...");
    const bindingKey = "booking_order_listener";
    this.consume(REQ_BOOKING_QUEUE,"OrderEventExchange" , bindingKey ,(msg) => handle_req_from_frontend(msg));
  };

  consumeBikeResponse = async () => {
    console.log("[ORDER SERVICE] Listening for bike responses...");
    const bindingKey = "bike_main_listener";
    this.consume(REQ_BIKE_QUEUE,"OrderEventExchange" , bindingKey ,(msg) => handle_res_from_bike(msg));
  };

  consumeHotelResponse = async () => {
    console.log("[ORDER SERVICE] Listening for hotel responses...");
    const bindingKey = "hotel_main_listener";
    this.consume(REQ_HOTEL_QUEUE,"OrderEventExchange" , bindingKey ,(msg) => handle_res_from_hotel(msg));
  };


  consumePaymentResponse = async () => {
    console.log("[ORDER SERVICE] Listening for payment responses...");
    const bindingKey = "payment_main_listener";
    this.consume(REQ_PAYMENT_QUEUE,"OrderEventExchange" , bindingKey ,(msg) => handle_res_from_payment(msg));
  };
  //---------------------------SAGA(REVERSE ORDER)---------------

  consumeHotelSagaResponse = async () => {
    console.log("[ORDER SERVICE] Listening for hotel saga responses...");
    const bindingKey = "hotel_saga_listener";
    this.consume(SAGA_RESP_HOTEL_QUEUE,"OrderEventExchange" , bindingKey ,(msg) => console.log(msg));
  };

  consumeBikeSagaResponse = async () => {
    console.log("[ORDER SERVICE] Listening for bike saga responses...");
    const bindingKey = "bike_saga_listener";
    this.consume(SAGA_RESP_BIKE_QUEUE,"OrderEventExchange" , bindingKey ,(msg) => console.log(msg));
  }


}

export  {
  RabbitClient, 
  RabbitPublisher,
  RabbitSubscriber
};