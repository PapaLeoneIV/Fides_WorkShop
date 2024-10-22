import { z } from "zod";

const registration_schema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(20),
});

export default registration_schema;