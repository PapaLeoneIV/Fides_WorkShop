import { z } from "zod";

const FrontendRegistrationSchema = z.object({
    email: z.string(),
    password: z.string().min(3).max(20),
});

export default FrontendRegistrationSchema;