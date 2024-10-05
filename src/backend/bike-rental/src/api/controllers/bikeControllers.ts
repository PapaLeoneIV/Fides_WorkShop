import { Request, Response } from "express";
import { parse_and_set_default_values } from "../parsing/bikeParser";
import { z } from "zod";
import {
  BikeOrderRepository,
  BikeDBManager,
  bikeDO,
} from "../service/bikeService";

const ORDER_APPROVED = "APPROVED"
const ORDER_DENIED = "DENIED"
const BIKE_REQUEST_APPROVED = "BIKEAPPROVED"
const ORDER_REVERTED = "REVERTED"
const BIKE_REQUEST_REVERTED = "BIKEORDERREVERTED"



const receive_data_schema = z.object({
  order_id: z.string(),
  road_bike_requested: z.string().refine((value) => !isNaN(Number(value)) && Number(value) >= 0, {
    message: "[BIKE SERVICE] Must be a string representing a number greater than or equal to 0",
  }),
  dirt_bike_requested: z.string().refine((value) => !isNaN(Number(value)) && Number(value) >= 0, {
    message: "[BIKE SERVICE] Must be a string representing a number greater than or equal to 0",
  }),
});

const revert_data_schema = z.object({
  order_id: z.string(),
});

export const receive_order = async (req: Request, res: Response): Promise<void> => {
  const order_repository = new BikeOrderRepository();
  const storage_repository = new BikeDBManager();
  let request: bikeDO;

  try {
    request = parse_and_set_default_values(req.body, receive_data_schema);
  } catch (error) {
    console.log('\x1b[36m%s\x1b[0m', "[BIKE SERVICE]", "Error parsing data: request body not valid!", error);
    res.status(400).json({ error: "Bad Request" });
    return;
  }

  if (await order_repository.check_existance(request.order_id)) {
    console.log('\x1b[36m%s\x1b[0m', "[BIKE SERVICE]", "Bike order already exist", request.order_id);
    res.status(409).json({ error: "Bike order already exists" });
    return;
  }

  let [order , available_dirt_bikes, available_road_bikes] = await Promise.all([
     order_repository.create_order(request),
     storage_repository.get_number_dirt_bikes(),
     storage_repository.get_number_road_bikes()
  ]);

  if (
    available_dirt_bikes >= order.dirt_bike_requested &&
    available_road_bikes >= order.road_bike_requested
  ) {
    order_repository.update_status(order, ORDER_APPROVED);
  } else {
    order_repository.update_status(order, ORDER_DENIED);
  }
  console.log('\x1b[36m%s\x1b[0m', "[BIKE SERVICE]", "Sending response to client BIKEAPPROVED");
  res.send(BIKE_REQUEST_APPROVED);
};

export const revert_order = async (req: Request, res: Response): Promise<void> => {
  console.log('\x1b[36m%s\x1b[0m', "[BIKE SERVICE]", "Reverting order...");

  const order_repository = new BikeOrderRepository();
  const storage_repository = new BikeDBManager();
  let request: bikeDO;

  try {
    request = parse_and_set_default_values(req.body, revert_data_schema);
  } catch (error) {
    console.log('\x1b[36m%s\x1b[0m', "[BIKE SERVICE]", "Error parsing data: request body not valid!", error);
    res.status(400).json({ error: "Bad Request" });
    return;
  }
  
  let info = await order_repository.get_order_info(request.order_id);
  if (!info){
    res.status(409).json({ error: "Bike order does not exist" });
    return;
  }
  storage_repository.increment_bike_count(info.road_bike_requested, info.dirt_bike_requested);
  order_repository.update_status(info, ORDER_REVERTED);
  res.send(BIKE_REQUEST_REVERTED);
};
