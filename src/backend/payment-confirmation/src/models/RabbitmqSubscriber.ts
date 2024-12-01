import logger from './config/logger';
import log  from '../config/logs';
import { RabbitmqClient } from './RabbitmqClient';

type HandlerCB = (msg: string, instance?: RabbitmqClient) => any;

class RabbitmqSubscriber extends RabbitmqClient
{
  constructor() { super(); }

  async consume(queue: string, exchange: string, routingKey: string, handlerFunc: HandlerCB) {

    if (!this.channel) { await this.connect(); }

    await this.channel.bindQueue(queue, exchange, routingKey);
    console.log(log.CLIENT.INFO.CONFIGURING("Queue bound to exchange", "", { queue, exchange, routingKey }));
    
    this.channel.consume(
      queue,
      (msg) => {
        {
          if (!msg) {
            return console.error(log.CLIENT.WARNING.OPERATING("Error consuming message", "", { queue, exchange, routingKey }));
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

export const subscriber = new RabbitmqSubscriber();