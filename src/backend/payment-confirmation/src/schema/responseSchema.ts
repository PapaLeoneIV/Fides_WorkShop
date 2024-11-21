import { z } from "zod";    

const orderRequestSchema = z.object({
    id: z.string(),
    status: z.string(),
});

export default orderRequestSchema;