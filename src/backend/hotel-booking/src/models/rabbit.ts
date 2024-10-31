import client, { Connection, Channel } from "amqplib";
import { handle_req_from_order_management, handle_cancel_request } from "../controller/handlers";
import { HOTEL_SERVICE_ORDER_REQ_QUEUE, HOTEL_SERVICE_SAGA_REQ_QUEUE } from "../config/rabbit";
import { rmqPass, rmqUser, rmqhost } from "../config/rabbit";
//import * as tsyringe from "tsyringe";
import { OrderResponseDTO } from "../dtos/orderResponse.dto";


type HandlerCB = (msg: string, instance?: RabbitClient) => any;

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
          appId: "HotelService",
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


}

//@tsyringe.singleton()
class RabbitPublisher extends RabbitClient {
  //----------------------SEND----------------------------------
  publish_to_order_management = async (body: OrderResponseDTO): Promise<void> => {
    console.log(`[HOTEL SERVICE] Sending to Order Management Service: `, body);
    const routingKey = "hotel_main_listener";
    this.publishEvent("OrderEventExchange", routingKey, body);
  }
  publish_to_order_managementSAGA = async (body: OrderResponseDTO): Promise<void> => {
    console.log(`[HOTEL SERVICE] Sending to Order Management Service:`, body);
    const routingKey = "hotel_saga_listener";
    this.publishEvent("OrderEventExchange", routingKey, body);
  }

}

//@tsyringe.singleton()
class RabbitSubscriber extends RabbitClient {
  consumeHotelOrder = async () => {
    console.log("[BIKE SERVICE] Listening for bike orders...");
    const routingKey = "BDhotel_request";
    this.consume(HOTEL_SERVICE_ORDER_REQ_QUEUE, "OrderEventExchange", routingKey, (msg) => handle_req_from_order_management(msg));
  };
  consumecancelHotelOrder = async () => {
    console.log("[BIKE SERVICE] Listening for bike orders...");
    const routingKey = "BDhotel_SAGA_request";
    this.consume(HOTEL_SERVICE_SAGA_REQ_QUEUE, "OrderEventExchange", routingKey, (msg) => handle_cancel_request(msg));
  };
}

export {
  RabbitClient,
  RabbitPublisher,
  RabbitSubscriber
};