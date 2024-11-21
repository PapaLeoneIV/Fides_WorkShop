import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import { Messages as log } from "../config/Messages";
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
    console.log(log.CONTROLLER.INFO.VALIDATING("Order request validated successfully", "", { request }).message);
  } catch (error) {
    console.error(log.CONTROLLER.WARNING.VALIDATING("Error validating order request", "", { error }).message);
    await updateExchange(response);
    return new Error(HTTPerror.BAD_REQUEST.message);
  }

  try {
    processOrderRequest(request);
    console.log(
      log.CONTROLLER.INFO.PROCESSING(`Order request ${request.order_id} processed successfully`, "", { request })
        .message
    );
  } catch (error) {
    console.error(log.CONTROLLER.ERROR.PROCESSING("Order request failed", "", { error }).message);
    response.order_id = request.order_id;
    await updateExchange(response);
    return error;
  }
}

export async function validateAndHandleCancellationRequest(msg: string) {
  let request: IOrderResponseDTO;
  let response: IOrderResponseDTO = { order_id: null, status: status.DENIED };

  try {
    request = CancelRequestSchema.parse(JSON.parse(msg));
    console.log(
      log.CONTROLLER.INFO.VALIDATING("Cancellation request validated successfully", "", { order_id: request.order_id })
        .message
    );
  } catch (error) {
    console.error(log.CONTROLLER.WARNING.VALIDATING("Error validating cancellation request", "", { error }).message);
    await updateExchange(response);
    return new Error(HTTPerror.BAD_REQUEST.message);
  }

  try {
    processCancellatioRequest(request);
    console.log(
      log.CONTROLLER.INFO.PROCESSING(`Cancellation request ${request.order_id} processed successfully`, "", {
        order_id: request.order_id,
      }).message
    );
  } catch (error) {
    console.error(log.CONTROLLER.ERROR.PROCESSING("Cancellation request failed", "", { error }).message);
    response.order_id = request.order_id;
    await updateExchange(response);
    return error;
  }
}
