import { exit } from 'process';
import logger from './config/logger';
import log from './config/logs';
import { EXCHANGE, QueueNames as queue } from './config/rabbitmq-config';
import bootService  from './boot/bootService';
import { subscriber } from './models/RabbitmqSubscriber';
import { validateAndHandleOrderRequest } from './controllers/request-controller';


async function main() {
    try {
        await bootService();
    } catch (error) {
        logger.error(log.BOOT.BOOTING(`Error starting Payment Confirmation Service: ${error}`));
        exit(1);
    }

    try {
        let ORDER_REQ_BK = subscriber.bindKeys.ConsumePaymentOrder
        subscriber.consume(queue.PAYMENT_RESP, EXCHANGE, ORDER_REQ_BK, (msg) => { validateAndHandleOrderRequest(msg) });
    } catch (error) {
        logger.error(log.BOOT.BOOTING(`Error starting Payment Confirmation Service: ${error}`));
    }    
}

main();

