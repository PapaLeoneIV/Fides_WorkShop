import express, { Router } from "express";
import { handler_send_data, handler_confirm_request, handler_bike_shop_update } from "../service/bikeService";

export const app = express();

const BikeRouter = Router();

/**TODO these function can be implemented using RABBITMQ and not GET and POST */
BikeRouter.get("/confirm_request", handler_confirm_request);
console.log("[INFO] Set up confirm_request route...");
BikeRouter.post("/send_data", handler_send_data);
console.log("[INFO] Set up send_data route...");
BikeRouter.post("/bike_shop_update", handler_bike_shop_update)

export { BikeRouter };
