import IOrderRequestDTO from "../dtos/IOrderRequestDTO"
import { OrderStatus as status } from "../config/OrderStatus";
import { parseRequest } from "../utils/parsing-helper";
import { OrderSchema } from "../utils/OrderSchema";
import { CancelSchema } from "../utils/CancelSchema";
import { handleCancellation, processOrderRequest, updateExchange } from "../service/bike-service";
import { publisher } from "../models/RabbitmqPublisher";

export async function validateAndHandleOrderRequest( msg: string ) {
    let ORDER_BK = publisher.bindKeys.PublishBikeOrder;

    let order_info: IOrderRequestDTO;
    try {
        order_info = await parseRequest(msg, OrderSchema);
    } catch (error) {
        console.error(`[controller] Error while parsing message:`, error);
        updateExchange(ORDER_BK, { id: "", status: status.DENIED });
        throw new Error("Error while parsing message");
    }
    processOrderRequest(order_info);
}

export async function validateAndHandleCancellationRequest( msg: string ) {
    let ORDER_BK = publisher.bindKeys.PublishBikeOrder;

    let order_id: string;
    try {
        order_id = await parseRequest(msg, CancelSchema);
    } catch (error) {
        console.error(`[controller] Error while parsing message:`, error);
        await updateExchange(ORDER_BK, { id: "", status: status.DENIED });
        return;
    }
    processCancellationRequest(order_id);
}