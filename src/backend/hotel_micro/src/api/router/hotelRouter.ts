import express, { Router } from "express";
import { receive_order, revert_order } from "../controller/hotelController";

export const app = express();

app.use(express.json())


const HotelRouter = Router();
/*TODO these function can be implemented using RABBITMQ and not GET and POST */

HotelRouter.post("/send_data", receive_order);
console.log("[INFO] Set up send_data route...");
HotelRouter.post("/revert_order", revert_order);
console.log("[INFO] Set up revert_order route...");

export { HotelRouter }; 
