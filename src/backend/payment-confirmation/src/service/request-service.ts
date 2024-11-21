import { Messages as log } from "../config/Messages";
import { OrderStatus as status } from "../config/OrderStatus";
import IOrderResponseDTO from "../dtos/IOrderResponseDTO";
import IOrderRequestDTO from "../dtos/IOrderRequestDTO";
import { EXCHANGE } from "../config/rabbitmq-config";
import { publisher } from "../models/RabbitmqPublisher";

async function updateExchange(resp: IOrderResponseDTO, bindKey: string = publisher.bindKeys.PublishPaymentOrder) {
  try {
    await publisher.publishEvent(EXCHANGE, bindKey, JSON.stringify(resp));
    console.log(log.SERVICE.INFO.PROCESSING(`Response ${resp.id} published successfully`, "", resp));
  } catch (error) {
    console.error(log.SERVICE.ERROR.PROCESSING(`Failed publishing response`, "", error));
    throw error;
  }
}

async function processOrderRequest(data: IOrderRequestDTO) {
  let response: IOrderResponseDTO = { id: data.id, status: null };

  try {
    //TODO: add some logic to call an external payment gateway to process the payment
    response.status = Math.random() < 0.9 ? status.APPROVED : status.DENIED;
    await updateExchange(response);
    console.log(
      log.SERVICE.INFO.PROCESSING(
        `Order request ${data.id} processed successfully with status: ${response.status}`,
        "",
        data
      )
    );
  } catch (error) {
    console.error(log.SERVICE.ERROR.PROCESSING(`Order request failed`, "", error));
    throw error;
  }
}

export { updateExchange, processOrderRequest };
