import bootService from "./boot/boot-service";
import { EXCHANGE, QueueNames as queue } from "./config/rabbit-config"
import { subscriber } from "./models/RabbitmqSubscriber"
import { validateAndHandleOrderRequest, validateAndHandleCancellationRequest } from "./controller/bike-controller";
import { publisher } from "./models/RabbitmqPublisher";

async function main() {

    await bootService();

    let CONSUME_ORDER_BK = publisher.bindKeys.ConsumeBikeOrder;
    let CONSUME_ORDER_SAGA_BK = publisher.bindKeys.ConsumeBikeSAGAOrder;

    console.log(`[boot] Setting up consumer`);
    subscriber.consume(queue.ORDER_REQUEST, EXCHANGE, CONSUME_ORDER_BK, (msg) => validateAndHandleOrderRequest(msg));
    subscriber.consume(queue.SAGA_REQUEST, EXCHANGE, CONSUME_ORDER_SAGA_BK, (msg) => validateAndHandleCancellationRequest(msg));
    console.log(`[boot] Consumer set up`);
}

main();

// ConsumeBikeOrder = async () => {
//     console.log("[BIKE SERVICE] Listening for bike orders...");
//     this.consume(BIKE_SERVICE_ORDER_REQ_QUEUE, "OrderEventExchange", this.bindKeys.ConsumeBikeOrder, (msg) => handle_req_from_order_management(msg));
//   };

//   consumecancelBikeOrder = async () => {
//     console.log("[BIKE SERVICE] Listening for bike orders cancellation requests...");
//     this.consume(BIKE_SERVICE_SAGA_REQ_QUEUE, "OrderEventExchange", this.bindKeys.ConsumeBikeSAGAOrder,(msg) => handle_cancel_request(msg));
//   }