import { rabbitPub } from '../models';
import payment_schema from '../zodschema/payment_schema';
import { DENIED, APPROVED, ERROR, CANCELLED } from "../config/status";



export async function handle_req_from_order_management(msg: string) {
    let response_info = { id: "", status: "" };
    let data;
    try {
        data = payment_schema.parse(JSON.parse(msg));
    } catch (error) {
        console.error(`[PAYMENT SERVICE] Error while parsing message:`, error);
        rabbitPub.publish_to_order_management(JSON.stringify({ id: "", status: DENIED }));
        return;
    }
    response_info.id = data.id;
    response_info.status = Math.random() < 0.9 ? APPROVED : DENIED;
    //send response to order management 
    rabbitPub.publish_to_order_management(JSON.stringify(response_info));

}
