import z from "zod"


export const cancel_req_schema = { 
    order_id: z.string(),
};