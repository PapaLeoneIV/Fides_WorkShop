import { RabbitClient } from "./RabbitmqClient";
import { Messages as log } from '../config/Messages';
import { HTTPErrors as HTTPerror} from "../config/HTTPErrors";
type HandlerCB = (msg: string, instance?: RabbitClient) => any;

class RabbitSubscriber extends RabbitClient {
    constructor() {
        super();
    }

    async consume(queue: string, exchange: string, routingKey: string, handlerFunc: HandlerCB) {
        if (!this.channel) { await this.connect(); }
        await this.channel.bindQueue(queue, exchange, routingKey);

        this.channel.consume( queue,
            (msg) => {{
                    if (!msg) { 
                        console.error(log.CLIENT.ERROR.OPERATING(`Consuming message from queue: ${queue} with routing key: ${routingKey} from exchange: ${exchange}`, "", { }).message);
                        throw new Error(HTTPerror.INTERNAL_SERVER_ERROR.message);                    }
                    handlerFunc(msg?.content?.toString());
                    this.channel.ack(msg);
                }
            }, { noAck: false, }
        );
    }
}

export const subscriber = new RabbitSubscriber();