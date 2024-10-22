import client, { Connection, Channel } from "amqplib";
import { handle_login_req, handle_registration_req } from "../controller/handlers";

type HandlerCB = (msg: string, instance?: RabbitClient) => any;

const LOGIN_QUEUE_REQUEST = "login_request"
const LOGIN_QUEUE_RESPONSE = "login_response"

const REGISTRATION_QUEUE_REQUEST = "registration_request"
const REGISTRATION_QUEUE_RESPONSE = "registration_response"

class RabbitClient {
    connection!: Connection;
    channel!: Channel;
    private connected!: Boolean;
  
    async connect() {
      if (this.connected && this.channel) return;
      else this.connected = true;
  
      try {
        console.log(`[AUTH SERVICE] Connecting to Rabbit-MQ Server`);
        this.connection = await client.connect(
          `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`
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
    
      async consumeLoginRequest() {
          await this.consume(LOGIN_QUEUE_REQUEST, handle_login_req);
      }
  
      async consumeRegistrationRequest() {
          await this.consume(REGISTRATION_QUEUE_REQUEST, handle_registration_req);
      }
  
    //----------------------SEND----------------------------------
   
    
      async sendLoginResp(message: any) {
          await this.sendToQueue(LOGIN_QUEUE_RESPONSE, message);
      }
  
      async sendRegistrationResp(message: any) {
          await this.sendToQueue(REGISTRATION_QUEUE_RESPONSE, message);
      }
  }

export default RabbitClient;