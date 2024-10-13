import express, { Router } from "express";
import { handler_book_vacation } from "../controller/orderController";

export const app = express();

app.use(express.json())

const OrderRouter = Router();

OrderRouter.post("/book_vacation", handler_book_vacation);
console.log("[INFO] Set up handler_book_vacation...")









export { OrderRouter };
