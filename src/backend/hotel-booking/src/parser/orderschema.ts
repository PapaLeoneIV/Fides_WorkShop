import { z } from 'zod';

export const hotel_info_schema = z.object({
  userEmail: z.string(),
  order_id: z.string(),
  to: z.string(),
  from: z.string(),
  room: z.string(),
  renting_status: z.string(),
  created_at: z.string().transform((val) => new Date(val)),
  updated_at: z.string().transform((val) => new Date(val)),
});