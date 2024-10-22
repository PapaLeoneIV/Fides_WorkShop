import { z } from 'zod';

let hotel_info_schema = z.object({
  order_id: z.string(),
  to: z.string(),
  from: z.string(),
  room: z.string(),
  renting_status: z.string(),
  created_at: z.string().transform((val) => new Date(val)),
  updated_at: z.string().transform((val) => new Date(val)),
});

export default hotel_info_schema;