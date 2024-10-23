import { z } from 'zod';

let bike_info_schema = z.object({
    order_id: z.string(),
    road_bike_requested: z.number().refine((val) => val >= 0 && Number.isInteger(val)),
    dirt_bike_requested: z.number().refine((val) => val >= 0 && Number.isInteger(val)),
    renting_status: z.string(),
    created_at: z.string().transform((val) => new Date(val)),
    updated_at: z.string().transform((val) => new Date(val)),
  });

  
  export default bike_info_schema;