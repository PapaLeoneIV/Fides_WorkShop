import { Request, Response } from "express";
import { z } from "zod";
import {
  BikeOrdersManager,
  BikeDBManager,
  bike_order,
} from "../service/bikeService";

const order_schema = z.object({
  order_id: z.string(),
  road_bike_requested: z.string(),
  dirt_bike_requested: z.string(),
});

export const receive_order = async (
  req: Request,
  res: Response
): Promise<void> => {
  const manager_ordini = new BikeOrdersManager();
  const manager_db = new BikeDBManager();
  let request_body: bike_order;
  
  try {
    request_body = order_schema.parse(req.body) as bike_order;
  } catch (error) {
    res.status(400).json({ error: "Bad Request" });
    console.log("Error parsing data: request body not valid!", error);
    return;
  }
  
  request_body.renting_status = "PENDING";
  request_body.created_at = new Date();
  request_body.updated_at = new Date();


  if (await manager_ordini.getBikeOrderInfoById(request_body.order_id)) {
    res.status(409).json({ error: "Bike order already exists" });
    return;
  }


  let new_bike_order = await manager_ordini.createBikeOrder(request_body);
  let available_dirt_bikes = await manager_db.getNumberOfDirtBikes();
  let available_road_bikes = await manager_db.getNumberOfRoadBikes();
  if (
    available_dirt_bikes >= new_bike_order.dirt_bike_requested &&
    available_road_bikes >= new_bike_order.road_bike_requested
  ) {
  manager_ordini.updateBikeOrderStatus(
      new_bike_order,
      "APPROVED"
    );
  } else {
  manager_ordini.updateBikeOrderStatus(
      new_bike_order,
      "DENIED"
    );
  }
  /*TODO change response */
  res.send(`BIKEORDER'${new_bike_order.info.order_id}'RECEIVED`);
};

export const revert_order = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("Reverting order...");

  const manager_ordini = new BikeOrdersManager();
  const manager_db = new BikeDBManager();
  let request_body: bike_order;

  /*TODO improve parsing */
  try {
    request_body = order_schema.parse(req.body)  as bike_order;
  } catch (error) {
    res.status(400).json({ error: "Bad Request" });
    console.log("Error parsing data: request body not valid!", error);
    return;
  }
  if (!await manager_ordini.getBikeOrderInfoById(request_body.order_id)) {
    res.status(409).json({ error: "Bike order does not exists" });
    return;
  }

  request_body.renting_status = "PENDING";
  request_body.created_at = new Date();
  request_body.updated_at = new Date();

  let order = await manager_ordini.createBikeOrder(request_body);

  manager_db.incrementBikeCount(order.road_bike_requested, order.dirt_bike_requested);
  manager_ordini.updateBikeOrderStatus(order, "REVERTED");
  
  res.send("BIKEORDERREVERTED");
};
