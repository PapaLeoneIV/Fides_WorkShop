import { Request, Response } from 'express';
import { order_context } from '../service/orderService';
import { z } from 'zod';

interface order_info {
  bikes: { road: string; dirt: string },
  hotel: { from: Date; to: Date; room: number },
  payment_info: { amount: string }
}

const parse_request = (body: any) => {
  const orderSchema = z.object({
    order: z.object({
      payment_info: z.object({
        amount: z.string()
      }),
      bikes: z.object({
        road: z.string(),
        dirt: z.string()
      }),
      hotel: z.object({
        to: z.string(),
        from: z.string(),
        room: z.string()
      })
    })
  });
  try {
    return orderSchema.parse(body);
  } catch (error) {
    console.log("Error parsing data: request body not valid!", error);
    throw new Error("Bad Request");
  }
};

export const handler_book_vacation = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsedBody = parse_request(req.body) as order_info;

    let { bikes, hotel, payment_info } = parsedBody;
    
    /*TODO qui devo creare il nuovo ordine con tutte le info e poi passare quello a order_context */



    const order = new order_context(bikes, hotel, payment_info);
    order.process_order(bikes, hotel, payment_info);

    res.status(202).send("Order is being processed");
  } catch (error: any) {
    if (error.message === "Bad Request") {
      res.status(400).json({ error: "Bad Request" });
    } else {
      console.log('Error processing order:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

