import { Request, Response } from "express";
import { logger } from "../../../../logger/logger";
import { z } from "zod";
import { check_hotel_availability } from "../service/hotelService";

const URL_order_management = "http://localhost:3003/order/hotel_update";

const order_schema = z.object({
  to: z.string(),
  from: z.string(),
  room: z.string(),
});

interface hotelRequested {
  to: string;
  from: string;
  room: string;
}
let hotel_booking: hotelRequested;

export const receive_order = async (req: Request, res: Response): Promise<void> => {
  let parsedBody: any;  
  try {
      parsedBody = order_schema.parse(req.body.hotel);
    } catch (error) {
      logger.error("Error parsing data: request body not valid!", error);
      res.status(400).json({ error: "Bad Request" });
      return;
    }
    try {
      hotel_booking = {
        to: parsedBody.to,
        from: parsedBody.from,
        room: parsedBody.room,
      };
      const db_response = await check_hotel_availability(hotel_booking);
      //RESPOND TO Order management
      if (db_response) { res.send("HOTELAPPROVED"); }
      else { res.send("HOTELDENIED");}  
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
      logger.error("Error parsing data: request body not valid!", error);
      return;
    }
  };

export const handler_confirm_request = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = { message: "Request taken in consideration, will answear back shortly!" };
        res.status(200).json(data);
    } catch (error) {
        console.error('Error sending data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const handler_hotel_update = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = { message: "Request taken in consideration, will answear back shortly!" };
        res.status(200).json(data);
    } catch (error) {
        console.error('Error sending data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}