import { z } from "zod";

const registration_schema = z.object({
    email: z.string(),
    password: z.string().min(3).max(20),
});

export default registration_schema;