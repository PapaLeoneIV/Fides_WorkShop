import { z } from 'zod';

export const CancelSchema = z.object({  
    order_id: z.string(),
});