import z from "zod"


export const cancel_req_schema = z.object({  
    order_id: z.string(),
});