import { z } from "zod";

const CancelRequestSchema = z.object({
  order_id: z.string(),
  status: z.string().nullable(),
});

export default CancelRequestSchema;
