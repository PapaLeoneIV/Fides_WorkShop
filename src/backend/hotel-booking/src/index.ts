import { Messages as message } from './config/Messages';
import bootService from './boot/boot-service';
import { subscriber } from './models/RabbitmqSubscriber';
import { publisher } from './models/RabbitmqPublisher';
import { QueueNames as queue, EXCHANGE } from './config/rabbit-config';
import { validateAndHandleOrderRequest, validateAndHandleCancellationRequest } from './controller/request-controllers';

async function main() {
 
    await bootService();

    let ORDER_BK = publisher.bindKeys.ConsumeHotelOrder;
    let SAGA_ORDER_BK = publisher.bindKeys.ConsumeHotelSAGAOrder;

    subscriber.consume(queue.ORDER_REQ, EXCHANGE, ORDER_BK, (msg) => validateAndHandleOrderRequest(msg));
    subscriber.consume(queue.SAGA_REQ, EXCHANGE, SAGA_ORDER_BK, (msg) => validateAndHandleCancellationRequest(msg));
    console.log(message.BOOT.INFO.CONFIGURING("Subscribers are consuming messages", {}));
}

main();

 