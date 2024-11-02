import * as z from "zod";
const response_schema = z.object({
    id: z.string(),
    status: z.string()
  });

export {
    response_schema,    
}
  