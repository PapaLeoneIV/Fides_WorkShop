import logger from '../config/logger';
import log from "../config/logs";
import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import { QueueNames as queue } from "../config/rabbit-config";
import { publisher } from "../models/RabbitmqPublisher";
import { subscriber } from "../models/RabbitmqSubscriber";

const bindingKeysUrl = "http://config-service:3000/config/orderKeys";

async function InitializeRabbitmqConnection() {
  try {
		//TODO: move fetching to a separate file
    publisher.bindKeys = await publisher.requestBindingKeys(bindingKeysUrl);
    subscriber.bindKeys = await subscriber.requestBindingKeys(bindingKeysUrl);
    logger.info(
      log.BOOT.FETCHING("Binging keys from config service fetched", {
        publisherKeys: publisher.bindKeys,
        subscriberKeys: subscriber.bindKeys,
      })
    );

    await publisher.connect();
    logger.info(
      log.BOOT.CONNECTING("Publisher connected to RabbitMQ", {
        publisherKeys: publisher.bindKeys,
      })
    );

    await subscriber.connect();
    logger.info(
      log.BOOT.CONNECTING("Subscriber connected to RabbitMQ", {
        subscriberKeys: subscriber.bindKeys,
      })
    );

    await publisher.setupExchange("OrderEventExchange", "direct");
    logger.info(log.BOOT.CONFIGURING(`Exchange OrderEventExchange`, { exchange: "OrderEventExchange" }));

    await subscriber.createQueue(queue.FRONTEND_REQ);
    await subscriber.createQueue(queue.BIKE_RESP);
    await subscriber.createQueue(queue.HOTEL_RESP);
    await subscriber.createQueue(queue.SAGA_BIKE_RESP);
    await subscriber.createQueue(queue.SAGA_HOTEL_RESP);
    await subscriber.createQueue(queue.PAYMENT_RESP);
    logger.info(
      log.BOOT.CONFIGURING("Queues ORDER_REQUEST and CANCEL_REQUEST", {
        queues: [
          queue.FRONTEND_REQ,
          queue.BIKE_RESP,
          queue.HOTEL_RESP,
          queue.SAGA_BIKE_RESP,
          queue.SAGA_HOTEL_RESP,
          queue.PAYMENT_RESP,
        ],
      })
    );
  } catch (error) {
    logger.error(log.BOOT.CONNECTING("Binding keys", { error }));
  }
}

export default InitializeRabbitmqConnection;
