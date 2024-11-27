import { z } from "zod";

const FrontendLoginSchema = z.object({
    email: z.string(),
    password: z.string().max(20),
    jwtToken: z.string().optional()
});

export default FrontendLoginSchema;