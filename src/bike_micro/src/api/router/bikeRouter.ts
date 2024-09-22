import express, { Router } from "express";
import { handler_send_data, handler_confirm_request, handler_bike_shop_update } from "../service/bikeService";

export const app = express();

const BikeRouter = Router();

BikeRouter.post("/send_data", handler_send_data);
console.log("Set up send_data route...");
BikeRouter.get("/confirm_request", handler_confirm_request);
console.log("Set up confirm_request route...");
BikeRouter.post("/bike_shop_update", handler_bike_shop_update)

export { BikeRouter };
