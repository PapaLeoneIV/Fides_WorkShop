import { Request, Response } from "express";
import { order_context, order_info } from "../service/orderService";
import { z } from "zod";


  const order_schema = z.object({
    amount: z.string(),
    road_bike_requested: z.string(),
    dirt_bike_requested: z.string(),
    to: z.string(),
    from: z.string(),
    room: z.string(),

  });
  const parse_and_set_default_values = (data: any) => {
    const parsedData = order_schema.parse(data);
    return {
      ...parsedData,
      order_status: "PENDING",
      created_at: new Date(),
      updated_at: new Date(),
    } as order_info;
  };

export const handler_book_vacation = async (
  req: Request,
  res: Response
): Promise<void> => {
  let request_body: order_info;
  try {
    request_body = parse_and_set_default_values(req.body);
  } catch (error) {
    console.log('\x1b[33m%s\x1b[0m', "[ORDER MANAGER]Error parsing data: request body not valid!", error);
    res.status(400).json({ error: "Bad Request" });
    return;
  }
  const order = new order_context(request_body);
  order.order = await order.manager_db.create_order(order.order);
  order.process_order(order.order);
  res.status(202).send("Order is being processed");
};
