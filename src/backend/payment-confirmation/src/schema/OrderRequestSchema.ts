import { z } from "zod";

const OrderRequestSchema = z.object({
  id: z.string(),
  amount: z.string(),
  created_at: z.string().transform((val) => new Date(val)),
  updated_at: z.string().transform((val) => new Date(val)),
});

export default OrderRequestSchema;
