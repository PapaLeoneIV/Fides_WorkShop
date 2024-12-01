import client, { Connection, Channel } from "amqplib";

const TOTAL_MESSAGES = 1;  // Adjust the total number of messages as needed
const DELAY = 100;  // Delay in milliseconds between messages to simulate load
const rmqUser = "rileone";
const rmqPass = "password";
const rmqhost = "localhost";
const QUEUE = 'order_service_booking_request';
const EXCHANGE = 'OrderEventExchange';
const LOGIN_RESP_QUEUE = 'order_service_login_response2';
const REGISTRATION_RESP_QUEUE = 'order_service_registration_response2';

//send
const ConsumeLoginReq = "auth_login_request";
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
            logger.info(`[TEST SERVICE] Connecting to Rabbit-MQ Server`);
            this.connection = await client.connect(
                `amqp://${rmqUser}:${rmqPass}@${rmqhost}:5672`
            );

            logger.info(`[TEST SERVICE] Rabbit MQ Connection is ready`);

            this.channel = await this.connection.createChannel();

            logger.info(`[TEST SERVICE] Created RabbitMQ Channel successfully`);
        } catch (error) {
            logger.error(error);
            logger.error(`[TEST SERVICE]Not connected to MQ Server`);
        }
    }
    async setupExchange(exchange: string, exchangeType: string) {

        try {
            // Declare a fanout exchange
            await this.channel.assertExchange(exchange, exchangeType, {
                durable: true,
            });
            logger.info(`[TEST SERVICE] Event Exchange '${exchange}' declared`);
        } catch (error) {
            logger.error(`[TEST SERVICE] Error setting up event exchange:`, error);
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
            logger.error("[ORDER SERVICE] Error publishing event:", error);
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
            logger.error("[ORDER SERVICE]", error);
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
            (msg: any) => {
                {
                    if (!msg) {
                        return logger.error(`Invalid incoming message`);
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
    publish_login_req = async (body: string): Promise<void> => {
        logger.info(`[TEST SERVICE] Publishing login req: `, body, "with routing keyy: ", ConsumeLoginReq);
        this.publishEvent("OrderEventExchange", ConsumeLoginReq, body);
    };
    publish_registration_req = async (body: string): Promise<void> => {
        logger.info(`[TEST SERVICE] Sending Publishing Registration req: `, body, "with routing key: ", ConsumeRegistrationReq);
        this.publishEvent("OrderEventExchange", ConsumeRegistrationReq, body);
    };
}

//@tsyringe.singleton()
class RabbitSubscriber extends RabbitClient {
    constructor() {
        super();
    }
    consume_login_resp = async () => {
        logger.info("[TEST SERVICE] Listening login responses..");
        this.consume(LOGIN_RESP_QUEUE, "OrderEventExchange", PublishLoginResp, (msg) => send_booking_order(JSON.parse(msg)));
    };

    consume_registration_resp = async () => {
        logger.info("[TEST SERVICE] Listening for booking orders...");
        this.consume(REGISTRATION_RESP_QUEUE, "OrderEventExchange", PublishRegistrationReq, (msg) => try_login(JSON.parse(msg)));
    };
}

const Publisher = new RabbitPublisher();
const Subscriber = new RabbitSubscriber();




const email = "foo@baz.com";
const password = "foobar";

let registration_info: LoginDTO = {
    email: email,
    password: password,
    jwtToken: "",
}

let registration_info_base: LoginDTO = {
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
    logger.info("[TESTER SERVICE] Received booking order: ", msg);
    msg = JSON.parse(msg);
    if (msg.status === "APPROVED") {
        message.userJWT = msg.userJWT;
        logger.info("[TESTER SERVICE] Booking successful");
    }
    else {
        logger.info("[TESTER SERVICE] Booking failed");
    }
}

async function try_login(msg: any) {
    msg = JSON.parse(msg);
    if (msg.status === "APPROVED") {
        logger.info("[TESTER SERVICE] Registration successful");
        await Publisher.publish_login_req(JSON.stringify(registration_info_base));
    }
    else if (msg.status === "ERROR" && msg.error === "Registration: User already exists") {

        logger.info("[TESTER SERVICE] User already exists");
        const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZvb0BiYXouY29tIiwiaWF0IjoxNzMwOTIwNTU4LCJleHAiOjE3MzA5MjA1NTl9.BqSjOnWhanjlzUh8nQqMsCzZHeEN";
        Publisher.publish_login_req(JSON.stringify({email: email, password: password, jwtToken: jwtToken}));


    }
    else {
        logger.info("[TESTER SERVICE] Registration failed");
    }
}



async function bootstrap() {

    logger.info("[TESTER SERVICE] Connecting to RabbitMQ...");
    await Publisher.connect();
    await Subscriber.connect();

    logger.info("[TESTER SERVICE] Setting up queues");
    await Publisher.createQueue(LOGIN_RESP_QUEUE);
    await Publisher.createQueue(REGISTRATION_RESP_QUEUE);

    try {
        await Publisher.channel.checkExchange(EXCHANGE);
    } catch (error) {
        logger.error('Error checking exchange:', error);
    }
}


async function listen() {
    Subscriber.consume_registration_resp();
    Subscriber.consume_login_resp();
}

async function send_login() {
    logger.info("[TESTER SERVICE] Sending login request...");
    const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZvb0BiYXouY29tIiwiaWF0IjoxNzMwOTIwNTU4LCJleHAiOjE3MzA5MjA1NTl9.BqSjOnWhanjlzUh8nQqMsCzZHeEN";
    Publisher.publish_login_req(JSON.stringify({email: email, password: password, jwtToken: jwtToken}));

}


async function main() {
    await bootstrap();
    Publisher.publish_registration_req(JSON.stringify({email: email, password: password}));
    listen();
    //Publisher.publish_login_req(JSON.stringify({email: email, password: password}));
    //Subscriber.consume_login_resp();
}

main();