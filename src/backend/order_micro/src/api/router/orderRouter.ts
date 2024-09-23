import express, { Router } from "express";
import { handler_book_vacation, handler_payment_update, handler_hotel_update, handler_bike_update } from "../service/orderService";
import { logger } from "../../../../logger/logger";

export const app = express();

app.use(express.json())

const OrderRouter = Router();

/**TODO these function can be implemented using RABBITMQ and not GET and POST */
OrderRouter.post("/book_vacation", handler_book_vacation);
logger.info("[INFO] Set up handler_book_vacation...")
OrderRouter.post("/payment_update", handler_payment_update );
logger.info("[INFO] Set up handler_book_vacation...")
OrderRouter.post("/hotel_update", handler_hotel_update);
logger.info("[INFO] Set up handler_book_vacation...")
OrderRouter.post("/bike_update", handler_bike_update);
logger.info("[INFO] Set up handler_book_vacation...")





export { OrderRouter };
