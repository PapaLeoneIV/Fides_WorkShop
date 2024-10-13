import express, { Router } from "express";
import { receive_order, revert_order } from "../controllers/bikeControllers";

export const app = express();

app.use(express.json())

const BikeRouter = Router();


BikeRouter.post("/send_data", receive_order);
console.log("[INFO] Set up send_data route...");

BikeRouter.post("/revert_order", revert_order);
console.log("[INFO] Set up revert_order route...");

export { BikeRouter };
