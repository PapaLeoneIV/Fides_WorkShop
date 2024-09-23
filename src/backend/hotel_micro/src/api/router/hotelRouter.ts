import express, { Router } from "express";
import { receive_order, handler_confirm_request, handler_hotel_update } from "../service/hotelService";
import { logger } from "../../../../logger/logger";

export const app = express();

app.use(express.json())


const HotelRouter = Router();
/**TODO these function can be implemented using RABBITMQ and not GET and POST */
HotelRouter.get("/confirm_request", handler_confirm_request);
logger.info("[INFO] Set up confirm_request route...");
HotelRouter.post("/send_data", receive_order);
logger.info("[INFO] Set up send_data route...");
HotelRouter.post("/hotel_update", handler_hotel_update)

export { HotelRouter }; 
