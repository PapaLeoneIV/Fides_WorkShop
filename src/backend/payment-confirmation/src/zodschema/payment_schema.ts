import { z } from "zod";    
const payment_schema = z.object({
    id: z.string(),
    amount: z.string(),
    created_at: z.string().transform((val) => new Date(val)),
    updated_at: z.string().transform((val) => new Date(val)),
});

export default payment_schema;