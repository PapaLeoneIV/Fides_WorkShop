import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export interface hotel_order {
  id: string;
  order_id: string;
  to: string;
  from: string;
  room: string;
  renting_status: string;
  created_at: Date;
  updated_at: Date;
}

export class HotelOrder {
  public info: hotel_order;

  constructor(info: hotel_order) {
    this.info = info;
    console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "Creating new hotel order object with id: ", info.order_id);
  }

  public get id(): string {
    return this.info.id;
  }

  public get order_id(): string {
    return this.info.order_id;
  }

  public get to(): string {
    return this.info.to
  }

  public get from(): string {
    return this.info.to
  }

  public get room(): string {
    return this.info.room
  }

  public get renting_status(): string {
    return this.info.renting_status;
  }

  public get created_at(): Date {
    return this.info.created_at;
  }

  public get updated_at(): Date {
    return this.info.updated_at;
  }
}


export class HotelOrdersManager {
  async check_existance(order_id: string): Promise<boolean> {
    console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "Checking if hotel order exists with id: ", order_id);
    const order =
      (await prisma.order.findFirst({
        where: {
          order_id: order_id,
        },
      })) || null;
    if (!order) {
      console.log(`[HOTEL SERVICE]Hotel order with id ${order_id} not found`);
      return false;
    }
    return true;
  }

  async create_order(hotel_order: hotel_order): Promise<HotelOrder> {
    console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "Creating new hotel order with id: ", hotel_order.order_id);
    const hotel = await prisma.order.create({
      data: {
        to: hotel_order.to,
        from: hotel_order.from,
        room: hotel_order.room,
        order_id: hotel_order.order_id,
        renting_status: hotel_order.renting_status,
        created_at: hotel_order.created_at,
        updated_at: hotel_order.updated_at,
      },
      
    });
    return new HotelOrder(hotel);
  }

  async get_order_info(order_id: string): Promise<hotel_order | null> {
    console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "Getting hotel order info with id: ", order_id);
    const order =
      (await prisma.order.findFirst({
        where: {
          order_id: order_id,
        },
      })) || null;
    if (!order) {
      console.log(`[HOTEL SERVICE]Hotel order with id ${order_id} not found`);
      return null;
    }
    return order;
  }

  async update_order(hotel_order: HotelOrder) {
    console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "Updating hotel order with id: ", hotel_order.order_id);
    const updated_bike_order = await prisma.order.update({
      where: {
        id: hotel_order.id,
      },
      data: {
        to: hotel_order.to,
        from: hotel_order.from,
        room: hotel_order.room,
        order_id: hotel_order.order_id,
        renting_status: hotel_order.renting_status,
        created_at: hotel_order.created_at,
        updated_at: hotel_order.updated_at,
      },
    });
    hotel_order.info = updated_bike_order;
  }

  async update_status(hotel_order: HotelOrder, status: string) {
    console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "Updating hotel order status with status: ", status);
    const updated_hotel_order = await prisma.order.update({
      where: {
        id: hotel_order.id,
      },
      data: {
        renting_status: status,
      },
    });
    hotel_order.info = updated_hotel_order;
  }

  async delete_order(hotel_order: HotelOrder) {
    console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "Deleting hotel order with id: ", hotel_order.order_id);
    await prisma.order.delete({
      where: {
        id: hotel_order.id,
      },
    });
  }

}

export class HotelDBManager {



  async getDateIdsForRange (from: Date, to: Date): Promise<any> {
    console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "Getting date ids for range: ", from, to);
    let result  = await prisma.date.findMany({
      where: {
        booking_date: {
          gte: from, // greater then or equal to
          lte: to, // less then or equal to
        },
      },
      select: {
        id: true,
      },
    });
    return result;
  };
  
  async areRoomsAvailable (dateIds: number[], roomNumber: string): Promise<boolean> {
    console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "Checking if", roomNumber,"is available for the selected dates");
    const availableRooms = await prisma.room.findMany({
      where: {
        date_id: {
          in: dateIds,
        },
        room_number: roomNumber,
        is_available: true,
      },
      select: {
        room_number: true,
      },
    });
    
    return availableRooms.length === dateIds.length;
  };


  async updateRoomAvailability ( dateIds: number[], roomNumber: string): Promise<void> {
    console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "Updating room availability for room ", roomNumber);
    let res = await prisma.room.updateMany({
      where: {
        date_id: {
          in: dateIds,
        },
        room_number: roomNumber,
      },
      data: {
        is_available: false,
      },
    });
    if (res)
      console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "Room updated successfully!")
    else
      console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "Room did not update sucessfully!")
  };

  async restoreRoomAvailability ( dateIds: number[], roomNumber: string): Promise<boolean> {
    console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "Restoring room availability for room ", roomNumber);
    let res : any = await prisma.room.updateMany({
      where: {
        date_id: {
          in: dateIds,
        },
        room_number: roomNumber,
      },
      data: {
        is_available: true,
      },
    });
    if(res)
      return true;
    return false;
  }
}
