import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import logger from '../config/logger';
import log  from "../config/logs";
import { OrderStatus as status } from "../config/OrderStatus";
import IOrderRequestDTO from "../dtos/IOrderRequestDTO";
import IOrderResponseDTO from "../dtos/IOrderResponseDTO";
import OrderRequestSchema from "../schema/OrderRequestSchema";
import { updateExchange, processOrderRequest } from "../service/request-service";

export async function validateAndHandleOrderRequest(msg: string) {
  let request: IOrderRequestDTO;
  let response: IOrderResponseDTO = { id: null, status: status.DENIED };

  try {
    request = OrderRequestSchema.parse(JSON.parse(msg));
    logger.info(log.CONTROLLER.VALIDATING(`Order request validated successfully`, { request }));
  } catch (error) {
    logger.error(log.CONTROLLER.VALIDATING(`Error validating order request: ${error}`, { error }));
    return await updateExchange(response);
  }

  try {
    processOrderRequest(request);
  } catch (error) {
    logger.error(log.CONTROLLER.PROCESSING(`Order request failed: ${error}`, "", request));
    response.id = request.id;
    await updateExchange(response);
  }
}
