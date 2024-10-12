import { Request, Response } from "express";

import { order as OrderDO } from "prisma/prisma-client"

import { BikeOrderRepository } from "../service/OrderRepository/OrderRepository";
import { BikeDBRepository } from "../service/StorageRepository/StorageRepository";

import { parse_and_set_default_values } from "../parser/bikeParser";

const ORDER_APPROVED = "APPROVED"
const ORDER_DENIED = "DENIED"
const BIKE_REQUEST_APPROVED = "BIKEAPPROVED"
const ORDER_REVERTED = "REVERTED"
const BIKE_REQUEST_REVERTED = "BIKEORDERREVERTED"

interface OrderDTO {
  order_id: string,
  road_bike_requested: number,
  dirt_bike_requested: number,
  renting_status: string,
  created_at: Date,
  updated_at: Date
}

export const receive_order = async (req: Request, res: Response): Promise<void> => {
  const order_repository = new BikeOrderRepository();
  const storage_repository = new BikeDBRepository();
  let request: OrderDTO;

  try {
    request = await parse_and_set_default_values(req.body, "RECEIVE_SCHEMA");
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
  let order: OrderDO
  let available_road_bikes : number;
  let available_dirt_bikes : number;

  [order, available_road_bikes, available_dirt_bikes] = await Promise.all([
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
  const storage_repository = new BikeDBRepository();
  let request: OrderDTO;

  try {
    request = await parse_and_set_default_values(req.body, "REVERT_SCHEMA");
  } catch (error) {
    console.log('\x1b[36m%s\x1b[0m', "[BIKE SERVICE]", "Error parsing data: request body not valid!", error);
    res.status(400).json({ error: "Bad Request" });
    return;
  }

  let info = await order_repository.get_order_info(request.order_id);
  if (!info) {
    res.status(409).json({ error: "Bike order does not exist" });
    return;
  }
  storage_repository.increment_bike_count(info.road_bike_requested, info.dirt_bike_requested);
  order_repository.update_status(info, ORDER_REVERTED);
  res.send(BIKE_REQUEST_REVERTED);
};
