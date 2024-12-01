import { EXCHANGE, QueueNames as queue } from "./config/rabbit-config"
import bootService from "./boot/bootService";
import { subscriber } from "./models/RabbitmqSubscriber"
import { publisher } from "./models/RabbitmqPublisher";
import { validateAndHandleOrderRequest, validateAndHandleCancellationRequest } from "./controller/request-controller";

async function main() {

    await bootService();

    let CONSUME_ORDER_BK = publisher.bindKeys.ConsumeBikeOrder;
    let CONSUME_ORDER_SAGA_BK = publisher.bindKeys.ConsumeBikeSAGAOrder;

    logger.info(`[boot] Setting up consumer`);
    subscriber.consume(queue.ORDER_REQ, EXCHANGE, CONSUME_ORDER_BK, (msg) => validateAndHandleOrderRequest(msg));
    subscriber.consume(queue.SAGA_REQ, EXCHANGE, CONSUME_ORDER_SAGA_BK, (msg) => validateAndHandleCancellationRequest(msg));
    logger.info(`[boot] Consumer set up`);
}

main();

// ConsumeBikeOrder = async () => {
//     logger.info("[BIKE SERVICE] Listening for bike orders...");
//     this.consume(BIKE_SERVICE_ORDER_REQ_QUEUE, "OrderEventExchange", this.bindKeys.ConsumeBikeOrder, (msg) => handle_req_from_order_management(msg));
//   };

//   consumecancelBikeOrder = async () => {
//     logger.info("[BIKE SERVICE] Listening for bike orders cancellation requests...");
//     this.consume(BIKE_SERVICE_SAGA_REQ_QUEUE, "OrderEventExchange", this.bindKeys.ConsumeBikeSAGAOrder,(msg) => handle_cancel_request(msg));
//   }