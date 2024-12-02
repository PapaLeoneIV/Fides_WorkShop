import logger from '../config/logger';
import log from "../config/logs";
import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import { QueueNames as queue } from "../config/rabbit-config";
import { publisher } from "../models/RabbitmqPublisher";
import { subscriber } from "../models/RabbitmqSubscriber";

const bikeKeysUrl = "http://config-service:3000/config/hotelKeys";

async function initializeRabbitmqConnection() {
  try {
    //TODO: move fetching to a separate file
    publisher.bindKeys = await publisher.requestBindingKeys(bikeKeysUrl);
    subscriber.bindKeys = await subscriber.requestBindingKeys(bikeKeysUrl);
    logger.info(
      log.BOOT.FETCHING("Binding keys from config service fetched", {
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

    await subscriber.createQueue(queue.ORDER_REQ);
    await subscriber.createQueue(queue.SAGA_REQ);
    logger.info(
      log.BOOT.CONFIGURING("Order request queues created", {
        queues: [queue.ORDER_REQ, queue.SAGA_REQ],
      })
    );
  } catch (error) {
    logger.error(log.BOOT.CONNECTING("RabbitMQ", { error }));
  }
}

export default initializeRabbitmqConnection;
