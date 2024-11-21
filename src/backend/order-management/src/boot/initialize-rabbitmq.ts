import { Messages as message } from "../config/Messages";
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
    console.log(
      message.BOOT.INFO.FETCHING("Binging keys from config service fetched", {
        publisherKeys: publisher.bindKeys,
        subscriberKeys: subscriber.bindKeys,
      })
    );

    await publisher.connect();
    console.log(
      message.BOOT.INFO.CONNECTING("Publisher connected to RabbitMQ", {
        publisherKeys: publisher.bindKeys,
      })
    );

    await subscriber.connect();
    console.log(
      message.BOOT.INFO.CONNECTING("Subscriber connected to RabbitMQ", {
        subscriberKeys: subscriber.bindKeys,
      })
    );

    await publisher.setupExchange("OrderEventExchange", "direct");
    console.log(message.BOOT.INFO.CONFIGURING(`Exchange OrderEventExchange`, { exchange: "OrderEventExchange" }));

    await subscriber.createQueue(queue.FRONTEND_REQ);
    await subscriber.createQueue(queue.BIKE_RESP);
    await subscriber.createQueue(queue.HOTEL_RESP);
    await subscriber.createQueue(queue.SAGA_BIKE_RESP);
    await subscriber.createQueue(queue.SAGA_HOTEL_RESP);
    await subscriber.createQueue(queue.PAYMENT_RESP);
    console.log(
      message.BOOT.INFO.CONFIGURING("Queues ORDER_REQUEST and CANCEL_REQUEST", {
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
    console.error(message.BOOT.ERROR.CONNECTING("Binding keys", { error }));
  }
}

export default InitializeRabbitmqConnection;
