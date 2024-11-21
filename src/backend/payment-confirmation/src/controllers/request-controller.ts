import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import { Messages as log } from "../config/Messages";
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
    console.log(log.CONTROLLER.INFO.VALIDATING(`Order request validated successfully`, "", request));
  } catch (error) {
    console.error(log.CONTROLLER.WARNING.VALIDATING(`Order request`, "", error));
    await updateExchange(response);
    throw new Error(HTTPerror.BAD_REQUEST.message);
  }

  try {
    processOrderRequest(request);
    console.log(log.CONTROLLER.INFO.PROCESSING(`Order request ${request.id} processed successfully`, "", request));
  } catch (error) {
    console.error(log.CONTROLLER.ERROR.PROCESSING(`Order request failed`, "", error));
    response.id = request.id;
    await updateExchange(response);
    throw error;
  }
}
