import client, { Connection, Channel } from "amqplib";
import { handle_req_from_order_management, handle_cancel_request } from "../controller/handlers";
import { BIKE_SERVICE_ORDER_REQ_QUEUE, BIKE_SERVICE_SAGA_REQ_QUEUE } from "../config/rabbit";
import { RabbitBindingKeysDTO } from "../dtos/rabbitBindingKeys.dto";
import { rmqPass, rmqUser, rmqhost } from "../config/rabbit";
//import * as tsyringe from "tsyringe";

import { OrderResponseDTO } from "../dtos/orderResponse.dto";


type HandlerCB = (msg: string, instance?: RabbitClient) => any;

class RabbitClient {
  bindKeys!:  RabbitBindingKeysDTO;
  connection!: Connection;
  channel!: Channel;
  private connected!: Boolean;

  async connect() {
    if (this.connected && this.channel) return;
    else this.connected = true;

    try {
      console.log(`[BIKE SERVICE] Connecting to Rabbit-MQ Server`);
      this.connection = await client.connect(
        `amqp://${rmqUser}:${rmqPass}@${rmqhost}:5672`
      );

      console.log(`[BIKE SERVICE] Rabbit MQ Connection is ready`);

      this.channel = await this.connection.createChannel();

      console.log(`[BIKE SERVICE] Created RabbitMQ Channel successfully`);
    } catch (error) {
      console.error(error);
      console.error(`[BIKE SERVICE]Not connected to MQ Server`);
    }
  }
  async setupExchange(exchange: string, exchangeType: string) {

    try {
      await this.channel.assertExchange(exchange, exchangeType, {
        durable: true,
      });
      console.log(`[BIKE SERVICE] Event Exchange '${exchange}' declared`);
    } catch (error) {
      console.error(`[BIKE SERVICE] Error setting up event exchange:`, error);
    }
  }
  async publishEvent(exchange: string, routingKey: string, message: OrderResponseDTO): Promise<boolean> {

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
          appId: "BikerService",
        }
      );
    } catch (error) {
      console.error("[BIKE SERVICE] Error publishing event:", error);
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
      console.error("[BIKE SERVICE]", error);
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
            return console.error(`[BIKE SERVICE] Invalid incoming message`);
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
    console.log(`[BIKE SERVICE] Requesting binding keys from: ${url}`);
    const response = await fetch(url, {method: "GET"});
    return await response.json();
  }

}


//@tsyringe.singleton()
class RabbitPublisher extends RabbitClient {
  constructor() {
    
    super();
  }
  //TODO aggiungere i vari meccanismi di retry and fallback in caso di errore
  publish_to_order_management = async (body: OrderResponseDTO): Promise<void> => {
    console.log(`[BIKE SERVICE] Sending to Order Management Service: `, body);
    this.publishEvent("OrderEventExchange", this.bindKeys.PublishBikeOrder, body);
  }
  publish_to_order_managementSAGA = async (body: OrderResponseDTO): Promise<void> => {
    console.log(`[BIKE SERVICE] Sending to Order Management Service:`,  body);
    this.publishEvent("OrderEventExchange", this.bindKeys.PublishbikeSAGAOrder, body);
  }
}

//@tsyringe.singleton() 
class RabbitSubscriber extends RabbitClient {
  constructor() {
    super();
  }

  //---------------------------CONSUME--------------------------

  ConsumeBikeOrder = async () => {
    console.log("[BIKE SERVICE] Listening for bike orders...");
    this.consume(BIKE_SERVICE_ORDER_REQ_QUEUE, "OrderEventExchange", this.bindKeys.ConsumeBikeOrder, (msg) => handle_req_from_order_management(msg));
  };

  consumecancelBikeOrder = async () => {
    console.log("[BIKE SERVICE] Listening for bike orders cancellation requests...");
    this.consume(BIKE_SERVICE_SAGA_REQ_QUEUE, "OrderEventExchange", this.bindKeys.ConsumeBikeSAGAOrder,(msg) => handle_cancel_request(msg));
  }
}

export {
  RabbitClient,
  RabbitPublisher,
  RabbitSubscriber
};