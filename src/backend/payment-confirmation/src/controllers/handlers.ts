import { rabbitmqClient } from '../models';
import payment_schema from '../zodschema/payment_schema';


export async function handle_req_from_order_management(msg: string) {
    let response_info = { id: "", status: "" };
    let data;
    try {
        const parsedMsg = JSON.parse(msg);
        data = payment_schema.parse(JSON.parse(parsedMsg.description));
    } catch (error) {
        console.error(`[PAYMENT SERVICE] Error while parsing message:`, error);
        rabbitmqClient.sendToOrderMessageBroker(JSON.stringify({ id: "", status: "DENIED" }));
        return;
    }
    response_info.id = data.id;
    response_info.status = Math.random() < 0.9 ? "APPROVED" : "DENIED";
    //send response to order management 
    rabbitmqClient.sendToOrderMessageBroker(JSON.stringify(response_info));

}
