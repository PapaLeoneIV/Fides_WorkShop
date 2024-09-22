import express, { Router } from "express";
import { handler_send_data ,handler_confirm_request , handler_bank_update} from "../service/moneyService";

export const app = express();

const MoneyRouter = Router();
/**TODO these function can be implemented using RABBITMQ and not GET and POST */
MoneyRouter.get("/confirm_request", handler_confirm_request);
console.log("[INFO] Set up confirm_request route...");
MoneyRouter.post("/send_data", handler_send_data);
console.log("[INFO] Set up send_data route...");
MoneyRouter.post("/bank_update", handler_bank_update)
console.log("[INFO] Set up bank_update...");

export { MoneyRouter };
