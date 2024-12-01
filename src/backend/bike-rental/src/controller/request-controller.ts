import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import { Messages as log } from "../config/Messages";
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
    console.log(log.CONTROLLER.INFO.VALIDATING(`Order request validated successfully`, "", request));
  } catch (error) {
    console.error(log.CONTROLLER.WARNING.VALIDATING(`Error validating order request`, "", error));
    await updateExchange(response);
    throw new Error(HTTPerror.BAD_REQUEST.message);
  }

  try {
    processOrderRequest(request);
    console.log(
      log.CONTROLLER.INFO.PROCESSING(`Order request ${request.order_id} processed successfully`, "", request)
    );
  } catch (error) {
    console.error(log.CONTROLLER.ERROR.PROCESSING(`Order request failed`, "", error));
    response.order_id = request.order_id;
    await updateExchange(response);
    throw error;
  }
}

export async function validateAndHandleCancellationRequest(msg: string) {
  let request:  string;
  let response: IOrderResponseDTO = { order_id: null, status: status.DENIED };

  try {
    request = JSON.parse(msg);
    console.log(log.CONTROLLER.INFO.VALIDATING(`Cancellation request validated successfully`, "", request));
  } catch (error) {
    console.error(log.CONTROLLER.WARNING.VALIDATING(`Error validating cancellation request`, "", error));
    await updateExchange(response);
    throw new Error(HTTPerror.BAD_REQUEST.message);
  }

  try {
    processCancellationRequest(request);
    console.log(
      log.CONTROLLER.INFO.PROCESSING(
        `Cancellation request ${request} processed successfully`,
        "",
        request
      )
    );
  } catch (error) {
    console.error(log.CONTROLLER.ERROR.PROCESSING(`Cancellation request failed`, "", error));
    response.order_id = request;
    await updateExchange(response);
    throw error;
  }
}
