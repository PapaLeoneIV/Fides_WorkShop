import { Messages as log } from "../config/Messages";
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
    console.log(
      log.BOOT.INFO.FETCHING("Binding keys from config service fetched", {
        publisherKeys: publisher.bindKeys,
        subscriberKeys: subscriber.bindKeys,
      })
    );

    await publisher.connect();
    console.log(
      log.BOOT.INFO.CONNECTING("Publisher connected to RabbitMQ", {
        publisherKeys: publisher.bindKeys,
      })
    );

    await subscriber.connect();
    console.log(
      log.BOOT.INFO.CONNECTING("Subscriber connected to RabbitMQ", {
        subscriberKeys: subscriber.bindKeys,
      })
    );

    await subscriber.createQueue(queue.PAYMENT_RESP);
    console.log(
      log.BOOT.INFO.CONFIGURING("Payment response queue created", {
        queue: queue.PAYMENT_RESP,
      })
    );
  } catch (error) {
    console.error(log.BOOT.ERROR.CONNECTING("RabbitMQ", { error }));
  }
}

export default initializeRabbitmqConnection;
