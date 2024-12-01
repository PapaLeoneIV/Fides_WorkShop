import { z } from "zod";

const FrontendLoginReqSchema = z.object({
    email: z.string(),
    jwtToken: z.string()
});

export default FrontendLoginReqSchema;