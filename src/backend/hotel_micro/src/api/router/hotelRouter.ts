import express, { Router } from "express";
import { receive_order, revert_order } from "../controller/hotelController";

export const app = express();

app.use(express.json())


const HotelRouter = Router();
/*TODO these function can be implemented using RABBITMQ and not GET and POST */
//HotelRouter.get("/confirm_request", handler_confirm_request);
//console.log("[INFO] Set up confirm_request route...");
HotelRouter.post("/send_data", receive_order);
console.log("[INFO] Set up send_data route...");
HotelRouter.post("/revert_order", revert_order);
console.log("[INFO] Set up revert_order route...");
//HotelRouter.post("/hotel_update", handler_hotel_update)
//console.log("[INFO] Set up hotel_update route...");
export { HotelRouter }; 
