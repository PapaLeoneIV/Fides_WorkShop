import { RabbitMQConnection } from "./connection";
import { z } from 'zod';


const payment_schema = z.object({
    id: z.string(),
    amount: z.string(),
    created_at: z.date(),
    updated_at: z.date(),    
});

export async function handle_req_from_order_management(instance: RabbitMQConnection, msg: string) {
    let response_info = {id : "", status: ""};
    let data;
    try {
        
        const parsedMsg = JSON.parse(msg);
        console.log("PARSED MSSGGGG::::::::", parsedMsg.description);
        data = payment_schema.parse(JSON.parse(parsedMsg.description));
    } catch (error) {
        console.error(`[PAYMENT SERVICE] Error while parsing message:`, error);
        //send ERROR to order management
        return; 
    }
    response_info.id = data.id;
    response_info.status = Math.random() < 0.9 ? "APPROVED" : "DENIED";
    //send response to order management 


}
