import * as z from "zod";

const ServiceResponseSchema = z.object({
  order_id: z.string(),
  status: z.string(),
});

export default ServiceResponseSchema;
