import { Messages as message } from './config/log-messages';
import bootService from './boot/boot-service';
import { subscriber } from './models/RabbitmqSubscriber';
import { publisher } from './models/RabbitmqPublisher';
import { QueueNames as queue, EXCHANGE } from './config/rabbit-config';
import { validateAndHandleOrderRequest, validateAndHandleCancellationRequest } from './controller/hotel-controllers';

async function main() {
 
    await bootService();

    let ORDER_BK = publisher.bindKeys.ConsumeHotelOrder;
    let SAGA_ORDER_BK = publisher.bindKeys.ConsumeHotelSAGAOrder;

    subscriber.consume(queue.ORDER_REQUEST, EXCHANGE, ORDER_BK, (msg) => validateAndHandleOrderRequest(msg));
    console.log(message.BOOT.INFO.CONSUMER_CONNECTED(`To RabbitMQ queue: ${queue.ORDER_REQUEST}`, "", {queue: queue.ORDER_REQUEST}).message);
    subscriber.consume(queue.SAGA_REQUEST, EXCHANGE, SAGA_ORDER_BK, (msg) => validateAndHandleCancellationRequest(msg));
    console.log(message.BOOT.INFO.CONSUMER_CONNECTED(`To RabbitMQ queue: ${queue.SAGA_REQUEST}`, "", {queue: queue.SAGA_REQUEST}).message);
}

main();

 