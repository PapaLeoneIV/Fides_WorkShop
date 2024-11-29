import express from "express";
import cors from "cors";
import {
  HTTPvalidateLoginRequest,
  HTTPvalidateRegistrationRequest,
  HTTPvalidateAndHandleUserInformation,
  HTTPvalidateAndHandleJwtRefreshRequest,
} from "../controller/HTTP-request-controller";

//TODO: we could/should move the routes to a separate file
const app = express();

app.use(express.json());
app.use(cors());

const userRouter = express.Router();
const jwtRouter = express.Router();

userRouter.post("/register", HTTPvalidateRegistrationRequest);
userRouter.post("/login", HTTPvalidateLoginRequest);

jwtRouter.post("/validateJWT", HTTPvalidateAndHandleUserInformation);
jwtRouter.post("/refreshJWT", HTTPvalidateAndHandleJwtRefreshRequest);

app.use("/users", userRouter);
app.use("/auth", jwtRouter);

export default app;
