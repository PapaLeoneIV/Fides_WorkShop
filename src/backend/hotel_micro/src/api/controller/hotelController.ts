import { Request, Response } from "express";
import { z } from "zod";
import { parse_and_set_default_values } from "../parser/hotelParser";
import {
  HotelOrdersManager, 
  HotelDBManager,
  hotel_order,
} from "../service/hotelService"


const send_data_schema = z.object({
    order_id : z.string(),
    from: z.string(),
    to: z.string(),
    room: z.string(),
  
});

const revert_data_schema = z.object({
    order_id: z.string(),
  });


export const receive_order = async (req: Request, res: Response): Promise<void> => {
  const manager_ordini = new HotelOrdersManager;
  const manager_db = new HotelDBManager;
  let request_body: hotel_order;  
  try {
    request_body = parse_and_set_default_values(req.body, send_data_schema);
    } catch (error) {
      console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "Error parsing data: request body not valid!", error);
      res.status(400).json({ error: "Bad Request" });
      return;
    }
    


    if (await manager_ordini.check_existance(request_body.order_id)) {
      console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "Hotel order already exist", request_body.order_id);
      res.status(409).json({ error: "Hotel order already exists" });
      return;
    }
    let [order, dateRecords] = await Promise.all([
      manager_ordini.create_order(request_body),
      manager_db.getDateIdsForRange(new Date(request_body.from), new Date(request_body.to))
    ])

    const dateIds = dateRecords.map((date : any) => date.id);

    if (dateIds.length === 0) {
      manager_ordini.update_status(order, "DENIED");
      console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "No dates found for the requested range.");
      res.send("HOTELORDERDENIED");
      return;
    }
    const roomsAvailable = await manager_db.areRoomsAvailable(dateIds, order.room);

    if (!roomsAvailable) {
      manager_ordini.update_status(order, "DENIED");
      console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "Room is not available for the entire date range.");
      res.send("HOTELORDERDENIED");
      return;
    }

    await manager_db.updateRoomAvailability(dateIds,  order.room);
    console.log(`[HOTEL SERVICE]Room ${ order.room} has been successfully booked.`);
    manager_ordini.update_status(order, "APPROVED");
    res.send(`HOTELAPPROVED`);
    return ;
  };

export const revert_order = async (req: Request, res: Response): Promise<void> => {
  const manager_ordini = new HotelOrdersManager;
  const manager_db = new HotelDBManager;
  let request_body: hotel_order;  
  try {
    request_body = parse_and_set_default_values(req.body, revert_data_schema);
    } catch (error) {
      console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "Error parsing data: request body not valid!", error);
      res.status(400).json({ error: "Bad Request" });
      return;
    }

    if (!await manager_ordini.check_existance(request_body.order_id)) {
      res.status(409).json({ error: "Bike order does not exists" });
      return;
    }

    let info = await manager_ordini.get_order_info(request_body.order_id);
    if (!info){
      res.status(409).json({ error: "Bike order does not exist" });
      return;
    }
    let order = await manager_ordini.create_order(info);


    let dateRecords = await manager_db.getDateIdsForRange(new Date(request_body.from), new Date(request_body.to))
    const dateIds = dateRecords.map((date : any) => date.id);

    if (dateIds.length === 0) {
      manager_ordini.update_status(order, "DENIED")
      console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "No dates found for the requested range.");
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