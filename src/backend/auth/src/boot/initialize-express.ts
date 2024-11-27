import express from "express";
import cors from "cors";
import {
  HTTPvalidateLoginRequest,
  HTTPvalidateRegistrationRequest,
  validateAndHandleUserInformation,
} from "../controller/HTTP-request-controller";

//TODO: we could/should move the routes to a separate file
const app = express();

const router = express.Router();

router.post("/register", HTTPvalidateRegistrationRequest);
router.post("/login", HTTPvalidateLoginRequest);
router.post("/validateJWT", validateAndHandleUserInformation);
app.use(express.json());
app.use(cors());

app.use("/users", router);
app.use("/auth", router);

export default app;
