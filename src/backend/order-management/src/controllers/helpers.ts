import { OrderResponseDTO } from "../dtos/OrderResponse.dto";
import { order as OrderEntity } from "@prisma/client";
import { rabbitPub } from "../models";
import { orderManagerDB } from "../models";
import { DENIED, CANCELLED, ERROR, PENDING } from "../config/status";


export function handle_error_response(resp: OrderResponseDTO): boolean {
    if ((resp.id === "" || resp.id === undefined) && resp.status === ERROR) {
        console.log(`[ORDER SERVICE] Error while processing request, the data sent was not correct`);
        return true;
    }
    return false;
}

export async function handle_response_general(order: OrderEntity, req_type: "bike" | "hotel"): Promise<boolean> {

    const status = req_type === "bike" ? order.bike_status : order.hotel_status;
    const statusUpdate = req_type === "bike" ? orderManagerDB.update_bike_status : orderManagerDB.update_hotel_status;
    const eventPublish = req_type === "bike" ? rabbitPub.publish_cancel_hotel_orderEvent : rabbitPub.publish_cancel_bike_orderEvent;

    if (status === DENIED) {
        await statusUpdate(order.id, CANCELLED);
        if (order.payment_status === PENDING) {
            console.log(`[ORDER SERVICE] Cancelling payment order...`);
            await orderManagerDB.update_payment_status(order.id, CANCELLED);
        }
        console.log(`[ORDER SERVICE] ${req_type} service denied the request, cancelling hotel...`);
        eventPublish(order.id);
        return true;
    }
    return false;
}