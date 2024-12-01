import logger from "../config/logger";
import log from "../config/logs";
import { OrderStatus as status } from "../config/OrderStatus";
import IOrderResponseDTO from "../dtos/IOrderResponseDTO";
import IOrderRequestDTO from "../dtos/IOrderRequestDTO";
import { EXCHANGE } from "../config/rabbitmq-config";
import { publisher } from "../models/RabbitmqPublisher";

async function updateExchange(resp: IOrderResponseDTO, bindKey: string = publisher.bindKeys.PublishPaymentOrder) {
  try {
    await publisher.publishEvent(EXCHANGE, bindKey, JSON.stringify(resp));
    logger.info(log.SERVICE.PROCESSING(`Response ${resp.id} published successfully`, "", resp));
  } catch (error) {
    logger.error(log.SERVICE.PROCESSING(`Failed publishing response: ${error}`, { error }));
    throw error;
  }
}

async function processOrderRequest(data: IOrderRequestDTO) {
  let response: IOrderResponseDTO = { id: data.id, status: null };

  try {
    //TODO: add some logic to call an external payment gateway to process the payment
    response.status = Math.random() < 0.9 ? status.APPROVED : status.DENIED;
    await updateExchange(response);
    logger.info(
      log.SERVICE.PROCESSING(`Order request ${data.id} processed successfully with status: ${response.status}`, {
        data,
      })
    );
  } catch (error) {
    logger.error(log.SERVICE.PROCESSING(`Order request failed`, "", error));
    throw error;
  }
}

export { updateExchange, processOrderRequest };
