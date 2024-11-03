import client, { Connection, Channel } from "amqplib";
import * as queue from "../config/rabbit";
import { handle_req_from_frontend, handle_res_from_bike, handle_res_from_hotel, handle_res_from_payment } from "../controllers/handlers";
import { rmqUser, rmqPass, rmqhost, Exchange } from "../config/rabbit";
import { BikeOrderDTO } from "../dtos/BikeOrder.dto";
import { HotelOrderDTO } from "../dtos/HotelOrder.dto";
import { PaymentOrderDTO } from "../dtos/PaymentOrder.dto";
import { RabbitBindingKeysDTO } from "../dtos/rabbitBindingKeys.dto";



type HandlerCB = (msg: string, instance?: RabbitClient) => any;


class RabbitClient {
  bindKeys!: RabbitBindingKeysDTO;
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
  async publishEvent(exchange: string, routingKey: string, message: any): Promise<boolean> {

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



  async consume(queue: string, exchange: string, routingKey: string, handlerFunc: HandlerCB) {

    if (!this.channel) {
      await this.connect();
    }
    await this.channel.bindQueue(queue, exchange, routingKey);

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

  async requestBindingKeys(url: string): Promise<RabbitBindingKeysDTO> {
    try {
      let response = await fetch(url, {method: "GET"});
      return await response.json();
    } catch (error) {
      console.error(`[ORDER SERVICE] Error fetching binding keys:`, error);
      throw error;
    }
  }




}

//@tsyringe.singleton()
class RabbitPublisher extends RabbitClient {
  constructor() {
    super();
  }


  publish_event = async (exchange: string, routingKey: string, message: any): Promise<void> => {
    this.publishEvent(exchange, routingKey, message);
  }


  //TODO aggiungere i vari meccanismi di retry and fallback in caso di errore
  publish_to_bike_orderEvent = async (body: BikeOrderDTO): Promise<void> => {
    console.log(`[ORDER SERVICE] Sending to Bike Service: `, body);
    this.publishEvent(Exchange, this.bindKeys.ConsumeBikeOrder, body);
  };
  publish_to_hotel_orderEvent = async (body: HotelOrderDTO): Promise<void> => {
    console.log(`[ORDER SERVICE] Sending to Hotel Service: ${body}`);
    this.publishEvent(Exchange, this.bindKeys.ConsumeHotelOrder, body);
  };
  publish_payment_orderEvent = async (body: PaymentOrderDTO): Promise<void> => {
    console.log(`[ORDER SERVICE] Sending to Payment Service: ${body}`);
    this.publishEvent(Exchange, this.bindKeys.ConsumePaymentOrder, body);
  };

  //---------------------------SAGA(REVERSE ORDER)---------------
  publish_cancel_bike_orderEvent = async (body: string): Promise<void> => {
    this.publishEvent(Exchange, this.bindKeys.ConsumeBikeSAGAOrder, body);
  }

  publish_cancel_hotel_orderEvent = async (body: string): Promise<void> => {
    this.publishEvent(Exchange, this.bindKeys.ConsumeHotelSAGAOrder, body);
  }
}

//@tsyringe.singleton()
class RabbitSubscriber extends RabbitClient {
  constructor() {
    super();
  }

  //---------------------------CONSUME--------------------------
  consumeBookingOrder = async () => {
    console.log("[ORDER SERVICE] Listening for booking orders...");
    const routingKey = "booking_order_listener";
    this.consume(queue.ORDER_SERVICE_REQ_BOOKING, Exchange, this.bindKeys.ConsumeBookingOrder, (msg) => handle_req_from_frontend(msg));
  };

  consumeBikeResponse = async () => {
    console.log("[ORDER SERVICE] Listening for bike responses...");
    this.consume(queue.ORDER_SERVICE_BIKE_RESP, Exchange, this.bindKeys.PublishBikeOrder, (msg) => handle_res_from_bike(msg));
  };

  consumeHotelResponse = async () => {
    console.log("[ORDER SERVICE] Listening for hotel responses...");
    this.consume(queue.ORDER_SERVICE_HOTEL_RESP, Exchange, this.bindKeys.PublishHotelOrder, (msg) => handle_res_from_hotel(msg));
  };


  consumePaymentResponse = async () => {
    console.log("[ORDER SERVICE] Listening for payment responses...");
    this.consume(queue.ORDER_SERVICE_RESP_PAYMENT, Exchange, this.bindKeys.PublishPaymentOrder, (msg) => handle_res_from_payment(msg));
  };
  //---------------------------SAGA(REVERSE ORDER)---------------

  consumeHotelSagaResponse = async () => {
    console.log("[ORDER SERVICE] Listening for hotel saga responses...");
    this.consume(queue.ORDER_SERVICE_SAGA_HOTEL_RESP, Exchange, this.bindKeys.PublishhotelSAGAOrder, (msg) => handle_res_from_hotel(msg));
  };

  consumeBikeSagaResponse = async () => {
    console.log("[ORDER SERVICE] Listening for bike saga responses...");
    this.consume(queue.ORDER_SERVICE_SAGA_BIKE_RESP, Exchange, this.bindKeys.PublishbikeSAGAOrder, (msg) => handle_res_from_bike(msg));
  }


}

export {
  RabbitClient,
  RabbitPublisher,
  RabbitSubscriber
};