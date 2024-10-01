import { Request, Response } from "express";
import { z } from "zod";
import {
  HotelOrdersManager, 
  HotelDBManager,
  hotel_order,
} from "../service/hotelService"


const order_schema = z.object({
  hotel: z.object({
    order_id : z.string(),
    from: z.string(),
    to: z.string(),
    room: z.string(),
  })
  
});

const parseOrderWithDefaults = (data: any) => {
  const parsedData = order_schema.parse(data).hotel;
  return {
    ...parsedData,
    renting_status: "PENDING",
    created_at: new Date(),
    updated_at: new Date(),
  } as hotel_order;
};

export const receive_order = async (req: Request, res: Response): Promise<void> => {
  const manager_ordini = new HotelOrdersManager;
  const manager_db = new HotelDBManager;
  let request_body: hotel_order;  
  try {
    request_body = parseOrderWithDefaults(req.body);
    } catch (error) {
      console.log("Error parsing data: request body not valid!", error);
      res.status(400).json({ error: "Bad Request" });
      return;
    }
    


    if (await manager_ordini.check_existance(request_body.order_id)) {
      console.log(request_body.order_id);
      res.status(409).json({ error: "Hotel order already exists" });
      return;
    }
    let [new_hotel_order, dateRecords] = await Promise.all([
      await manager_ordini.create_order(request_body),
      await manager_db.getDateIdsForRange(new Date(request_body.from), new Date(request_body.to))
    ])

    const dateIds = dateRecords.map((date : any) => date.id);

    if (dateIds.length === 0) {
      manager_ordini.update_status(new_hotel_order, "DENIED");
      console.log("No dates found for the requested range.");
      return;
    }
    const roomsAvailable = await manager_db.areRoomsAvailable(dateIds, new_hotel_order.room);

    if (!roomsAvailable) {
      manager_ordini.update_status(new_hotel_order, "DENIED");
      console.log("Room is not available for the entire date range.");
      return;
    }

    await manager_db.updateRoomAvailability(dateIds,  new_hotel_order.room);
    console.log(`Room ${ new_hotel_order.room} has been successfully booked.`);
    manager_ordini.update_status(new_hotel_order, "APPROVED");

    return ;
  };

export const revert_order = async (req: Request, res: Response): Promise<void> => {
  const manager_ordini = new HotelOrdersManager;
  const manager_db = new HotelDBManager;
  let request_body: hotel_order;  
  try {
    request_body = parseOrderWithDefaults(req.body);
    } catch (error) {
      console.log("Error parsing data: request body not valid!", error);
      res.status(400).json({ error: "Bad Request" });
      return;
    }

    if (!await manager_ordini.check_existance(request_body.order_id)) {
      res.status(409).json({ error: "Bike order does not exists" });
      return;
    }

    request_body.renting_status = "PENDING";
    request_body.created_at = new Date();
    request_body.updated_at = new Date();

    let order = await manager_ordini.create_order(request_body);

    let dateRecords = await manager_db.getDateIdsForRange(new Date(request_body.from), new Date(request_body.to))
    const dateIds = dateRecords.map((date : any) => date.id);

    if (dateIds.length === 0) {
      manager_ordini.update_status(order, "DENIED")
      console.log("No dates found for the requested range.");
      return;
    }

    if (await manager_db.restoreRoomAvailability(dateIds, order.room))
    {
      manager_ordini.update_status(order, "REVERTED")
      res.send("HOTELORDERREVERTED")
    }
    else
    {
      manager_ordini.update_status(order, "DENIED")
      res.send("NOTHOTELORDERREVERTED")
    }


  
  }