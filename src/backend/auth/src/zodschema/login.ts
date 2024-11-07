import { z } from "zod";

const login_schema = z.object({
    email: z.string(),
    password: z.string().max(20),
    jwtToken: z.string().optional()
});

export default login_schema;