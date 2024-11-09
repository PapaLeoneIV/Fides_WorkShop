import bootService from "./boot/boot-service";
import { EXCHANGE, QueueNames as queue } from "./config/rabbit-config"
import { subscriber } from "./models/RabbitmqSubscriber"
import { handleOrderCancellation, handleOrderRequest } from "./controller/bike-controller";
import { publisher } from "./models/RabbitmqPublisher";

async function main() {

    await bootService();
    
    let ORDER_BK = publisher.bindKeys.PublishBikeOrder;
    let ORDER_SAGA_BK = publisher.bindKeys.PublishbikeSAGAOrder;
    
    console.log(`[boot] Setting up consumer on ${ORDER_BK} and ${ORDER_SAGA_BK}`);
    subscriber.consume(queue.ORDER_REQUEST, EXCHANGE, ORDER_BK, (msg) => handleOrderRequest(msg));
    subscriber.consume(queue.SAGA_REQUEST, EXCHANGE, ORDER_SAGA_BK, (msg) => handleOrderCancellation(msg));
    console.log(`[boot] Consumer set up on ${ORDER_BK} and ${ORDER_SAGA_BK}`);
}

main();