import { Messages as message } from "../config/log-messages";
import { PrismaClient } from "@prisma/client";
import IOrderRequestDTO from "../dtos/IOrderRequestDTO";

class ReadHotelRepository {
  private prisma: PrismaClient;
  
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
  
  async getDateIdsForRange (from: Date, to: Date): Promise<any> {
    console.log(message.REPOSITORY.DEBUG.READING_DATA("Getting date ids for range", "", { from, to }).message);
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
    if (result.length !== 0) {
      console.log(message.REPOSITORY.INFO.READING_DATA("Date ids obtained", "", { from, to }).message);
      return result;
    }
    console.log(message.REPOSITORY.WARNING.READING_DATA("Date ids not obtained", "", { from, to }).message);
    return;
  };
  
  async areRoomsAvailable (dateIds: number[], roomNumber: string): Promise<boolean> {
    console.log(message.REPOSITORY.DEBUG.READING_DATA(roomNumber));
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
    console.log(message.REPOSITORY.INFO.READING_DATA(roomNumber));
    return availableRooms.length === dateIds.length;
  };
  
  async getBookedDays(order: IOrderRequestDTO & { id: string }): Promise<number[]> {
    let bookedDaysID =  await this.getDateIdsForRange(new Date(order.from), new Date(order.to));
    return bookedDaysID.map((date: any) => date.id);
  }
}


class WriteHotelRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async updateRoomAvailability ( dateIds: number[], roomNumber: string): Promise<boolean> {
    console.log(message.REPOSITORY.DEBUG.WRITING_DATA("Updating room availability", "", { dateIds, roomNumber }).message);
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
    if (res) {
      console.log(message.REPOSITORY.INFO.WRITING_DATA("Room availability updated", "", { dateIds, roomNumber }).message);
      return true;
    }
    console.log(message.REPOSITORY.WARNING.WRITING_DATA("Room availability not updated", "", { dateIds, roomNumber }).message);
    return false;
  };

  async restoreRoomAvailability ( dateIds: number[], roomNumber: string): Promise<boolean> {
    console.log(message.REPOSITORY.DEBUG.WRITING_DATA("Restoring room availability", "", { dateIds, roomNumber }).message);
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
    if(res) {
      console.log(message.REPOSITORY.INFO.WRITING_DATA(roomNumber));
      return true;
    }
    console.log(message.REPOSITORY.WARNING.WRITING_DATA("Room availability not restored"));
    return false;
  }
}


class HotelRepository {
  public read: ReadHotelRepository;
  public write: WriteHotelRepository;
  
  constructor(prisma: PrismaClient) {
    this.read = new ReadHotelRepository(prisma);
    this.write = new WriteHotelRepository(prisma);
  }
}

const prisma = new PrismaClient();
export const hotelRepository = new HotelRepository(prisma);