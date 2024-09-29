import { Request, Response } from "express";
import { z } from "zod";
import {
  BikeOrdersManager,
  BikeDBManager,
  BikeOrder,
} from "../service/bikeService";

const order_schema = z.object({
  id: z.string(),
  road_bike_requested: z.string(),
  dirt_bike_requested: z.string(),
});

export const receive_order = async (
  req: Request,
  res: Response
): Promise<void> => {
    /*TODO improve parsing */
  let parsedBody: any;
  try {
    parsedBody = order_schema.parse(req.body.bikes);
  } catch (error) {
    res.status(400).json({ error: "Bad Request" });
    console.log("Error parsing data: request body not valid!", error);
    return;
  }

  const manager_ordini = new BikeOrdersManager();
  const manager_db = new BikeDBManager();
  let bike_order = new BikeOrder(parsedBody);

  manager_ordini.createBikeOrder(bike_order);
  let available_dirt_bikes = await manager_db.getNumberOfDirtBikes();
  let available_road_bikes = await manager_db.getNumberOfRoadBikes();
  if (
    available_dirt_bikes >= bike_order.dirt_bike_requested &&
    available_road_bikes >= bike_order.road_bike_requested
  ) {
    manager_ordini.updateBikeOrderStatus(bike_order.info.id, "APPROVED");
  } else {
    manager_ordini.updateBikeOrderStatus(bike_order.info.id, "DENIED");
  }
  res.send(`BIKEORDER'${bike_order.info.renting_status}'`); 
};

export const revert_order = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("Reverting order...");
  let parsedBody: any;
  
  /*TODO improve parsing */
  try {
    parsedBody = order_schema.parse(req.body.bikes);
  } catch (error) {
    res.status(400).json({ error: "Bad Request" });
    console.log("Error parsing data: request body not valid!", error);
    return;
  }


  const manager_ordini = new BikeOrdersManager();
  const manager_db = new BikeDBManager();
  let bike_order = await manager_ordini.getBikeOrderById(parsedBody.id);
  if (!bike_order) {
    res.status(404).json({ error: "Bike order not found" });
    return;
  }
  manager_db.incrementBikeCount(
    parsedBody.road_bike_requested,
    parsedBody.dirt_bike_requested
  );
  manager_ordini.deleteBikeOrder(bike_order.id);
  res.send("BIKEORDERREVERTED");
};
