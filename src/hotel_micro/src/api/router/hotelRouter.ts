import express, { Router } from "express";
import { handler_send_data, handler_confirm_request, handler_hotel_update } from "../service/hotelService";

export const app = express();

const HotelRouter = Router();

HotelRouter.post("/send_data", handler_send_data);
console.log("Set up send_data route...");
HotelRouter.get("/confirm_request", handler_confirm_request);
console.log("Set up confirm_request route...");
HotelRouter.post("/hotel_update", handler_hotel_update)

export { HotelRouter };
