import express, { Router } from "express";
import { receive_order ,handler_confirm_request , handler_bank_update} from "../service/moneyService";
import { logger } from "../../../../logger/logger";

export const app = express();

app.use(express.json())


const MoneyRouter = Router();
/**TODO these function can be implemented using RABBITMQ and not GET and POST */
MoneyRouter.get("/confirm_request", handler_confirm_request);
logger.info("[INFO] Set up confirm_request route...");
MoneyRouter.post("/send_data", receive_order);
logger.info("[INFO] Set up send_data route...");
MoneyRouter.post("/bank_update", handler_bank_update)
logger.info("[INFO] Set up bank_update...");

export { MoneyRouter };
