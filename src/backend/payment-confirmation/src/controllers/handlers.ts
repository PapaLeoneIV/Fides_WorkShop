import { RabbitClient } from "../router/rabbitMQClient";
import { z } from 'zod';


const payment_schema = z.object({
    id: z.string(),
    amount: z.string(),
    created_at: z.string().transform((val) => new Date(val)),
    updated_at: z.string().transform((val) => new Date(val)),
});

export async function handle_req_from_order_management(instance: RabbitClient, msg: string) {
    let response_info = { id: "", status: "" };
    let data;
    try {
        const parsedMsg = JSON.parse(msg);
        data = payment_schema.parse(JSON.parse(parsedMsg.description));
    } catch (error) {
        console.error(`[PAYMENT SERVICE] Error while parsing message:`, error);
        instance.sendToOrderMessageBroker(JSON.stringify({ id: "", status: "DENIED" }));
        return;
    }
    response_info.id = data.id;
    response_info.status = Math.random() < 0.9 ? "APPROVED" : "DENIED";
    //send response to order management 
    instance.sendToOrderMessageBroker(JSON.stringify(response_info));

}
