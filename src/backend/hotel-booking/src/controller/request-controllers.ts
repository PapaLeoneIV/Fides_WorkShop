import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import logger from '../config/logger';
import log  from "../config/logs";
import { OrderStatus as status } from "../config/OrderStatus";
import IOrderRequestDTO from "../dtos/IOrderRequestDTO";
import IOrderResponseDTO from "../dtos/IOrderResponseDTO";
import OrderRequestSchema from "../schemas/OrderRequestSchema";
import CancelRequestSchema from "../schemas/CancelRequestSchema";
import { processCancellatioRequest, processOrderRequest, updateExchange } from "../service/request-service";

export async function validateAndHandleOrderRequest(msg: string) {
  let request: IOrderRequestDTO;
  let response: IOrderResponseDTO = { order_id: null, status: status.DENIED };

  try {
    request = OrderRequestSchema.parse(JSON.parse(msg));
    logger.info(log.CONTROLLER.VALIDATING("Order request validated successfully", "", { request }).message);
  } catch (error) {
    logger.error(log.CONTROLLER.VALIDATING("Error validating order request", "", { error }).message);
    return await updateExchange(response);
  }

  try {
    processOrderRequest(request);
  } catch (error) {
    logger.error(log.CONTROLLER.PROCESSING("Order request failed", "", { error }).message);
    response.order_id = request.order_id;
    await updateExchange(response);
  }
}

export async function validateAndHandleCancellationRequest(msg: string) {
  let request: IOrderResponseDTO;
  let response: IOrderResponseDTO = { order_id: null, status: status.DENIED };

  try {
    request = CancelRequestSchema.parse(JSON.parse(msg));
    logger.info(
      log.CONTROLLER.VALIDATING("Cancellation request validated successfully", "", { order_id: request.order_id })
        .message
    );
  } catch (error) {
    logger.error(log.CONTROLLER.VALIDATING("Error validating cancellation request", "", { error }).message);
    return await updateExchange(response);
  }

  try {
    processCancellatioRequest(request);
  } catch (error) {
    logger.error(log.CONTROLLER.PROCESSING("Cancellation request failed", "", { error }).message);
    response.order_id = request.order_id;
    await updateExchange(response);
  }
}
