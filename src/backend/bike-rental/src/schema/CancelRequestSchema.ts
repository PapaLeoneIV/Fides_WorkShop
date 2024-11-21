import { z } from "zod";

const CancelRequestSchema = z.object({
  order_id: z.string(),
  status: z.literal("CANCELLED"),
});

export default CancelRequestSchema;
