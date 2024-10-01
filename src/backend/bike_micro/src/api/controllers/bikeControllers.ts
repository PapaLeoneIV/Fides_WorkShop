import { Request, Response } from "express";
import { z } from "zod";
import {
  BikeOrdersManager,
  BikeDBManager,
  bike_order,
} from "../service/bikeService";

const order_schema = z.object({
    order_id: z.string(),
    road_bike_requested: z.string().refine((value) => !isNaN(Number(value)) && Number(value) >= 0, {
      message: "Must be a string representing a number greater than or equal to 0",
    }),
    dirt_bike_requested: z.string().refine((value) => !isNaN(Number(value)) && Number(value) >= 0, {
      message: "Must be a string representing a number greater than or equal to 0",
    }),
  });

const parseOrderWithDefaults = (data: any) => {
  const parsedData = order_schema.parse(data);
  return {
    ...parsedData,
    renting_status: "PENDING",
    created_at: new Date(),
    updated_at: new Date(),
  } as bike_order;
};

export const receive_order = async (req: Request, res: Response): Promise<void> => {
  const manager_ordini = new BikeOrdersManager();
  const manager_db = new BikeDBManager();
  let request_body: bike_order;

  try {
    console.log(req.body);
    request_body = parseOrderWithDefaults(req.body);
  } catch (error) {
    res.status(400).json({ error: "Bad Request" });
    console.log("Error parsing data: request body not valid!", error);
    return;
  }

  if (await manager_ordini.check_existance(request_body.order_id)) {
    console.log(request_body.order_id);
    res.status(409).json({ error: "Bike order already exists" });
    return;
  }

  let [new_bike_order, available_dirt_bikes, available_road_bikes] = await Promise.all([
    await manager_ordini.create_order(request_body),
    await manager_db.getNumberOfDirtBikes(),
    await manager_db.getNumberOfRoadBikes()
  ]);

  if (
    available_dirt_bikes >= new_bike_order.dirt_bike_requested &&
    available_road_bikes >= new_bike_order.road_bike_requested
  ) {
    manager_ordini.update_status(new_bike_order, "APPROVED");
  } else {
    manager_ordini.update_status(new_bike_order, "DENIED");
  }

  res.send(`BIKEORDER '${new_bike_order.order_id}' RECEIVED`);
};

export const revert_order = async (req: Request, res: Response): Promise<void> => {
  console.log("Reverting order...");

  const manager_ordini = new BikeOrdersManager();
  const manager_db = new BikeDBManager();
  let request_body: bike_order;

  try {
    request_body = parseOrderWithDefaults(req.body);
  } catch (error) {
    res.status(400).json({ error: "Bad Request" });
    console.log("Error parsing data: request body not valid!", error);
    return;
  }

  if (!(await manager_ordini.check_existance(request_body.order_id))) {
    res.status(409).json({ error: "Bike order does not exist" });
    return;
  }

  let order = await manager_ordini.create_order(request_body);
  manager_db.incrementBikeCount(order.road_bike_requested, order.dirt_bike_requested);
  manager_ordini.update_status(order, "REVERTED");

  res.send("BIKEORDER REVERTED");
};
