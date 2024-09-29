import express, { Router } from "express";
import { receive_order } from "../controller/paymentController";

export const app = express();

app.use(express.json())


const MoneyRouter = Router();
/*TODO these function can be implemented using RABBITMQ and not GET and POST */
MoneyRouter.post("/send_data", receive_order);
console.log("[INFO] Set up send_data route...");


export { MoneyRouter };
