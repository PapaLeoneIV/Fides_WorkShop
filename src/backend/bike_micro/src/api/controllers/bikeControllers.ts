import { Request, Response } from "express";
import { parse_and_set_default_values } from "../parsing/bikeParser";
import { z } from "zod";
import {
  BikeOrdersManager,
  BikeDBManager,
  bike_order,
} from "../service/bikeService";

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
  const manager_DB_ordini = new BikeOrdersManager();
  const manager_db = new BikeDBManager();
  let request_body: bike_order;

  try {
    request_body = parse_and_set_default_values(req.body, receive_data_schema);
  } catch (error) {
    console.log('\x1b[36m%s\x1b[0m', "[BIKE SERVICE]", "Error parsing data: request body not valid!", error);
    res.status(400).json({ error: "Bad Request" });
    return;
  }

  if (await manager_DB_ordini.check_existance(request_body.order_id)) {
    console.log('\x1b[36m%s\x1b[0m', "[BIKE SERVICE]", "Bike order already exist", request_body.order_id);
    res.status(409).json({ error: "Bike order already exists" });
    return;
  }

  let [order, available_dirt_bikes, available_road_bikes] = await Promise.all([
     manager_DB_ordini.create_order(request_body),
     manager_db.getNumberOfDirtBikes(),
     manager_db.getNumberOfRoadBikes()
  ]);

  if (
    available_dirt_bikes >= order.dirt_bike_requested &&
    available_road_bikes >= order.road_bike_requested
  ) {
    manager_DB_ordini.update_status(order.info, "APPROVED");
  } else {
    manager_DB_ordini.update_status(order.info, "DENIED");
  }
  console.log('\x1b[36m%s\x1b[0m', "[BIKE SERVICE]", "Sending response to client BIKEAPPROVED");
  res.send(`BIKEAPPROVED`);
};

export const revert_order = async (req: Request, res: Response): Promise<void> => {
  console.log('\x1b[36m%s\x1b[0m', "[BIKE SERVICE]", "Reverting order...");

  const manager_DB_ordini = new BikeOrdersManager();
  const manager_db = new BikeDBManager();
  let request_body: bike_order;

  try {
    request_body = parse_and_set_default_values(req.body, revert_data_schema);
  } catch (error) {
    console.log('\x1b[36m%s\x1b[0m', "[BIKE SERVICE]", "Error parsing data: request body not valid!", error);
    res.status(400).json({ error: "Bad Request" });
    return;
  }

  if (!(await manager_DB_ordini.check_existance(request_body.order_id))) {
    res.status(409).json({ error: "Bike order does not exist" });
    return;
  }
  
  let info = await manager_DB_ordini.get_order_info(request_body.order_id);
  if (!info){
    res.status(409).json({ error: "Bike order does not exist" });
    return;
  }
  manager_db.incrementBikeCount(parseInt(info.road_bike_requested, 10), parseInt(info.dirt_bike_requested, 10));
  manager_DB_ordini.update_status(info, "REVERTED");
  res.send("BIKEORDERREVERTED");
};
