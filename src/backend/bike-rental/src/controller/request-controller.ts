import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import logger from '../config/logger';
import log  from "../config/logs";
import { OrderStatus as status } from "../config/OrderStatus";
import IOrderRequestDTO from "../dtos/IOrderRequestDTO";
import IOrderResponseDTO from "../dtos/IOrderResponseDTO";
import OrderRequestSchema from "../schema/OrderRequestSchema";
import CancelRequestSchema from "../schema/CancelRequestSchema";
import { processCancellationRequest, processOrderRequest, updateExchange } from "../service/request-service";

export async function validateAndHandleOrderRequest(msg: string) {
  let request: IOrderRequestDTO;
  let response: IOrderResponseDTO = { order_id: null, status: status.DENIED };

  try {
    request = OrderRequestSchema.parse(JSON.parse(msg));
    logger.info(log.CONTROLLER.VALIDATING(`Order request validated successfully`, "", request));
  } catch (error) {
    logger.error(log.CONTROLLER.VALIDATING(`Error validating order request`, "", error));
    await updateExchange(response);
    throw new Error(HTTPerror.BAD_REQUEST.message);
  }

  try {
    processOrderRequest(request);
    logger.info(
      log.CONTROLLER.PROCESSING(`Order request ${request.order_id} processed successfully`, "", request)
    );
  } catch (error) {
    logger.error(log.CONTROLLER.PROCESSING(`Order request failed`, "", error));
    response.order_id = request.order_id;
    await updateExchange(response);
    throw error;
  }
}

export async function validateAndHandleCancellationRequest(msg: string) {
  let request: IOrderResponseDTO;
  let response: IOrderResponseDTO = { order_id: null, status: status.DENIED };

  try {
    request = CancelRequestSchema.parse(JSON.parse(msg));
    logger.info(log.CONTROLLER.VALIDATING(`Cancellation request validated successfully`, "", request.order_id));
  } catch (error) {
    logger.error(log.CONTROLLER.VALIDATING(`Error validating cancellation request`, "", error));
    await updateExchange(response);
    throw new Error(HTTPerror.BAD_REQUEST.message);
  }

  try {
    processCancellationRequest(request);
    logger.info(
      log.CONTROLLER.PROCESSING(
        `Cancellation request ${request.order_id} processed successfully`,
        "",
        request.order_id
      )
    );
  } catch (error) {
    logger.error(log.CONTROLLER.PROCESSING(`Cancellation request failed`, "", error));
    response.order_id = request.order_id;
    await updateExchange(response);
    throw error;
  }
}
