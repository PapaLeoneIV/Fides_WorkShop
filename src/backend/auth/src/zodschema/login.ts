import { z } from "zod";

const login_schema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(20),
    jwtToken: z.string().optional()
});

export default login_schema;