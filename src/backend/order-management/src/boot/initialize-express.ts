import express from "express";
import cors from "cors";
import {
  HTTPValidateAndHandleConfirmationRequest,
  HTTPValidateAndHandleFrontendRequest,
} from "../controller/request-controller";
let app = express();

let router = express.Router();

router.use(express.json());
router.use(cors());

//TODO: Consider renaming  the FrontendRequest to domething like OrderRequest
router.post("/booking", HTTPValidateAndHandleFrontendRequest);
router.get("/confirmation", HTTPValidateAndHandleConfirmationRequest);

app.use("/order", router);

export default app;
