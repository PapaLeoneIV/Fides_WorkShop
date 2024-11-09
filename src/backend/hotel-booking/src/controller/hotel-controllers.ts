import { Messages as lmsg } from "../config/log-messages";
import IOrderRequestDTO from "../dtos/IOrderRequestDTO";
import { parseRequest } from "../utils/parsing-helper";
import { OrderSchema } from "../utils/OrderSchema";
import { OrderStatus as status } from "../config/OrderStatus";
import { publisher } from "../models/RabbitmqPublisher";
import { processCancellatioRequest, processOrderRequest, updateExchange } from "../service/hotel-service";

export async function validateAndHandleOrderRequest( msg: string ) {
    console.log(lmsg.CONTROLLER.INFO.REQUEST_RECEIVED("Order Request", "", { msg }).message);
    let ORDER_BK = publisher.bindKeys.PublishHotelOrder;

    let order_info: IOrderRequestDTO;
    try {
        order_info = await parseRequest(msg, OrderSchema);
    } catch (error) {
        console.error(lmsg.CONTROLLER.ERROR.VALIDATING_REQUEST("Order Request", "", { error }).message);
        await updateExchange(ORDER_BK, { id: "", status: status.DENIED });
        return;
    }
    console.log(lmsg.CONTROLLER.INFO.REQUEST_VALIDATED(`Order Request ${order_info.order_id}`, "", { order_info }).message);
    processOrderRequest(order_info);
}

export async function validateAndHandleCancellationRequest( order_id: string ) {
    console.log(lmsg.CONTROLLER.INFO.REQUEST_RECEIVED("Cancellation Request", "", { order_id }).message);
    processCancellatioRequest(order_id);
}