import { Messages as log } from "./config/Messages";
import bootService from "./boot/bootService";
import { QueueNames as queue, EXCHANGE } from "./config/rabbit-config";
import { subscriber } from "./models/RabbitmqSubscriber";
import { validateAndHandleFrontendRequest } from "./controller/request-controller";
import app from "./boot/initialize-express";
import {
  validateAndHandleBikeResponse,
  validateAndHandleHotelResponse,
  validateAndHandlePaymentResponse,
} from "./controller/response-controller";

async function main() {
  await bootService();

  let CONSUME_ORDER_BK = subscriber.bindKeys.ConsumeBookingOrder;
  let PUBLISH_BIKE_BK = subscriber.bindKeys.PublishBikeOrder;
  let PUBLISH_HOTEL_BK = subscriber.bindKeys.PublishHotelOrder;
  let PUBLISH_PAYMENT_BK = subscriber.bindKeys.PublishPaymentOrder;
  let PUBLISH_HOTEL_SAGA_BK = subscriber.bindKeys.PublishhotelSAGAOrder;
  let PUBLISH_BIKE_SAGA_BK = subscriber.bindKeys.PublishbikeSAGAOrder;

  //CONSUME
  subscriber.consume(queue.FRONTEND_REQ, EXCHANGE, CONSUME_ORDER_BK, (msg) => validateAndHandleFrontendRequest(msg));
  subscriber.consume(queue.BIKE_RESP, EXCHANGE, PUBLISH_BIKE_BK, (msg) => validateAndHandleBikeResponse(msg));
  subscriber.consume(queue.HOTEL_RESP, EXCHANGE, PUBLISH_HOTEL_BK, (msg) => validateAndHandleHotelResponse(msg));
  subscriber.consume(queue.PAYMENT_RESP, EXCHANGE, PUBLISH_PAYMENT_BK, (msg) => validateAndHandlePaymentResponse(msg));

  //CONSUME SAGA
  subscriber.consume(queue.SAGA_HOTEL_RESP, EXCHANGE, PUBLISH_HOTEL_SAGA_BK, (msg) =>
    validateAndHandleHotelResponse(msg)
  );
  subscriber.consume(queue.SAGA_BIKE_RESP, EXCHANGE, PUBLISH_BIKE_SAGA_BK, (msg) => validateAndHandleBikeResponse(msg));

  app.listen(3000, () => {
    console.log(log.SERVICE.INFO.PROCESSING(`Server is running on port 3000`));
  });
}

main();
