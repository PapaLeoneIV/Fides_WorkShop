import client, { Connection, Channel } from "amqplib";
import { handle_req_from_order_management } from "../controllers/handlers";
import { PAYMENT_SERVICE_RESP_PAYMENT_QUEUE } from "../config/rabbit";
import { rmqPass, rmqUser, rmqhost } from "../config/rabbit";
import { RabbitBindingKeysDTO } from "../dtos/RabbitBindingKeys.dto";

//import * as tsyringe from "tsyringe";

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
  async setupExchange(exchange: string, exchangeType: string) {

    try {
      // Declare a fanout exchange
      await this.channel.assertExchange(exchange, exchangeType, {
        durable: true,
      });
      console.log(`[PAYMENT SERVICE] Event Exchange '${exchange}' declared`);
    } catch (error) {
      console.error(`[PAYMENT SERVICE] Error setting up event exchange:`, error);
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
        Buffer.from(message),
        {
          //TODO se necessario continuare a customizzare il channel
          appId: "PaymentService",
        }
      );
    } catch (error) {
      console.error("[PAYMENT SERVICE] Error publishing event:", error);
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
      console.error("[PAYMENT SERVICE]", error);
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
      const response = await fetch(url, {method: "GET"});
      return await response.json();
    } catch (error) {
      console.error(`[PAYMENT SERVICE] Error fetching binding keys:`, error);
      throw error;
    }
  }



}

//@tsyringe.singleton()
class RabbitPublisher extends RabbitClient
{
  constructor() {
    super();
  }
  publish_to_order_management = async (body: string): Promise<void> => {
    console.log(`[PAYMENT SERVICE] Sending to Order Management Service: `, body);
    this.publishEvent("OrderEventExchange", this.bindKeys.PublishPaymentOrder, body);
  };
}

//@tsyringe.singleton()
class RabbitSubscriber extends RabbitClient
{
  constructor() {
    super();
  }
  consumePaymentgOrder = async () => {
    console.log("[PAYMENT SERVICE] Listening for booking orders...");
    this.consume(PAYMENT_SERVICE_RESP_PAYMENT_QUEUE, "OrderEventExchange" ,  this.bindKeys.ConsumePaymentOrder ,(msg) => handle_req_from_order_management(msg));
  };
}

export {
  RabbitPublisher,
  RabbitSubscriber
};