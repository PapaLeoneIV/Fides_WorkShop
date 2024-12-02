import logger from '../config/logger';
import log  from "../config/logs";
import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import { QueueNames as queue } from "../config/rabbitmq-config";
import { publisher } from "../models/RabbitmqPublisher";
import { subscriber } from "../models/RabbitmqSubscriber";

const paymentKeysUrl = "http://config-service:3000/config/paymentKeys";

async function initializeRabbitmqConnection() {
  try {
    //TODO: move fetching to a separate file
    publisher.bindKeys = await publisher.requestBindingKeys(paymentKeysUrl);
    subscriber.bindKeys = await subscriber.requestBindingKeys(paymentKeysUrl);
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

    await subscriber.createQueue(queue.PAYMENT_RESP);
    logger.info(
      log.BOOT.CONFIGURING("Payment response queue created", {
        queue: queue.PAYMENT_RESP,
      })
    );
  } catch (error) {
    logger.error(log.BOOT.CONNECTING(`Error connecting to RabbitMQ: ${error}`));
  }
}

export default initializeRabbitmqConnection;
