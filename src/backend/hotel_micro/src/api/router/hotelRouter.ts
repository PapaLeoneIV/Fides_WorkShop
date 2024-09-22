import express, { Router } from "express";
import { handler_send_data, handler_confirm_request, handler_hotel_update } from "../service/hotelService";

export const app = express();

const HotelRouter = Router();
/**TODO these function can be implemented using RABBITMQ and not GET and POST */
HotelRouter.get("/confirm_request", handler_confirm_request);
console.log("[INFO] Set up confirm_request route...");
HotelRouter.post("/send_data", handler_send_data);
console.log("[INFO] Set up send_data route...");
HotelRouter.post("/hotel_update", handler_hotel_update)

export { HotelRouter }; 
