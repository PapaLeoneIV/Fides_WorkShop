import client, { Connection, Channel } from "amqplib";

const TOTAL_MESSAGES = 1;  // Adjust the total number of messages as needed
const DELAY = 100;  // Delay in milliseconds between messages to simulate load
const rmqUser = "rileone";
const rmqPass = "password";
const rmqhost = "localhost";
const QUEUE = 'order_service_booking_request';
const EXCHANGE = 'OrderEventExchange';
const LOGIN_RESP_QUEUE = 'order_service_login_response';
const REGISTRATION_RESP_QUEUE = 'order_service_registration_response';

//send
const LoginRequest = 'auth_login_request';
//receive
const PublishLoginResp = "auth_login_response";

//send
const ConsumeRegistrationReq = "auth_registration_request";
//receive
const PublishRegistrationReq = "auth_registration_response";

interface LoginDTO {
    password: string;
    email: string;
    jwtToken?: string;
}




type HandlerCB = (msg: string, instance?: RabbitClient) => any;

class RabbitClient {
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

class RabbitPublisher extends RabbitClient
{
  constructor() {
    super();
  }
  publish_login_req = async (body: string): Promise<void> => {
    console.log(`[PAYMENT SERVICE] Sending to Order Management Service: `, body);
    this.publishEvent("OrderEventExchange", LoginRequest, body);
  };
  publish_registration_req = async (body: string): Promise<void> => {
    console.log(`[PAYMENT SERVICE] Sending to Order Management Service: `, body);
    this.publishEvent("OrderEventExchange", ConsumeRegistrationReq , body);
  };
}

//@tsyringe.singleton()
class RabbitSubscriber extends RabbitClient
{
  constructor() {
    super();
  }
  consume_login_resp = async () => {
    console.log("[PAYMENT SERVICE] Listening for booking orders...");
    this.consume(LOGIN_RESP_QUEUE, "OrderEventExchange" ,  PublishLoginResp ,(msg) => send_booking_order(JSON.parse(msg)));
  };

  consume_registration_resp = async () => {
    console.log("[PAYMENT SERVICE] Listening for booking orders...");
    this.consume(REGISTRATION_RESP_QUEUE, "OrderEventExchange" ,  PublishRegistrationReq , (msg) => try_login(JSON.parse(msg)));
  };
}

const Publisher = new RabbitPublisher();
const Subscriber = new RabbitSubscriber();




const email = "foo@baz.com";
const password = "foobar";

const registration_info : LoginDTO =  {
  email: email,
  password: password,
}
let message = {
  userJWT: "",
  userEmail: email,
  from: new Date(2025, 12, 22),
  to: new Date(2025, 12, 23),
  room: "104",
  road_bike_requested: 3,
  dirt_bike_requested: 3,
  bike_status: "PENDING",
  hotel_status: "PENDING",
  payment_status: "PENDING",
  amount: (100).toString(),
  updated_at: new Date(),
  created_at: new Date(),
};



async function send_booking_order(msg: any) {
  console.log("[TESTER SERVICE] Received booking order: ", msg);
  if(msg.status === "APPROVED") {
    message.userJWT = msg.userJWT;
    console.log("[TESTER SERVICE] Booking successful");
}
else {
    console.log("[TESTER SERVICE] Booking failed");
  }
}

async function try_login(msg: any) {
  console.log("[TESTER SERVICE] Received registration response: ", msg);
  if(msg.status === "APPROVED") {
    console.log("[TESTER SERVICE] Registration successful");
  }
  else {
    console.log("[TESTER SERVICE] Registration failed");
  }
  await Publisher.publish_login_req(JSON.stringify(registration_info));
}

async function bootstrap() {
  console.log("[TESTER SERVICE] Connecting to RabbitMQ...");
  await Publisher.connect();
  await Subscriber.connect();

  console.log("{TESTER SERVICE] Setting up queues");
  await Publisher.createQueue(LOGIN_RESP_QUEUE);
  await Publisher.createQueue(REGISTRATION_RESP_QUEUE);

  try {
    await Publisher.channel.checkExchange(EXCHANGE);
} catch (error) {
    console.error('Error checking exchange:', error);
}


}

async function start_test() {
  await bootstrap();
  
  await Subscriber.consume_registration_resp(); 
  await Subscriber.consume_login_resp();


  

  await Publisher.publish_registration_req(JSON.stringify(registration_info));

}



start_test();

// async function publishMessage() {
//     try {
//         // Connect to RabbitMQ
//         const connection = await amqp.connect(`amqp://rileone:password@localhost:5672`);
//         const channel = await connection.createChannel();

//         // Ensure the queue exists
//         try {
//             await channel.checkExchange(EXCHANGE, 'direct', { durable: true });
//         } catch (error) {
//             console.error('Error checking exchange:', error);
//         }

//         await channel.assertQueue(QUEUE, { durable: true });

        
//         // Function to publish a single message
//         const sendSingleMessage = async (count) => {
//             const message = {
//                 userJWT: "eyJhbGci",
//                 userEmail: "account@test.test",
//                 from: new Date(2025, (3 + count) % 12, (3 + count) % 28),
//                 to: new Date(2025, (3 + count) % 12, (3 + count) % 28 + 1),
//                 room: "104",
//                 road_bike_requested: count % 5 + 1,
//                 dirt_bike_requested: count % 3 + 1,
//                 bike_status: "PENDING",
//                 hotel_status: "PENDING",
//                 payment_status: "PENDING",
//                 amount: (100 + count).toString(),
//                 updated_at: new Date(),
//                 created_at: new Date(),
//             };

//             // Send the message to the queue
//             channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(message)), {
//                 persistent: true,
//             });

//             console.log(`Message #${count + 1} sent to ${QUEUE}:`, message);
//         };

//         // Publish multiple messages
//         console.time("StressTestDuration");
//         for (let i = 0; i < TOTAL_MESSAGES; i++) {
//             await sendSingleMessage(i);
//             await new Promise((resolve) => setTimeout(resolve, DELAY));  // Optional delay
//         }
//         console.timeEnd("StressTestDuration");

//         // Close the channel and connection
//         await channel.close();
//         await connection.close();
//         console.log(`Stress test completed. Sent ${TOTAL_MESSAGES} messages.`);
//     } catch (error) {
//         console.error('Error during stress test:', error);
//     }
// }

// // Execute the stress test
// publishMessage();
