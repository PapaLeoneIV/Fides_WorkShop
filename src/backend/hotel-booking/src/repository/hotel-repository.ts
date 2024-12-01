import logger from '../config/logger';
import log  from "../config/logs";
import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import { PrismaClient } from "@prisma/client";
import IOrderRequestDTO from "../dtos/IOrderRequestDTO";

class ReadHotelRepository {
  private prisma: PrismaClient;

  private async getDateIdsForRange(from: Date, to: Date): Promise<{ id: number }[] | null> {
    let result: { id: number }[] | null = null;

    try {
      result = await prisma.date.findMany({
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
      if (result.length === 0) throw new Error(HTTPerror.NOT_FOUND.message);
      logger.info(log.REPOSITORY.READING(`Date ids for range ${from} to ${to}`, "", result));
      return result;
    } catch (error) {
      logger.error(log.REPOSITORY.READING(`Error reading date ids for range ${from} to ${to}`, "", error));
      throw error;
    }
  }

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async areRoomsAvailable(dateIds: number[], roomNumber: string): Promise<boolean> {
    let result: any | null;

    try {
      result = await prisma.room.findMany({
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
      logger.info(log.REPOSITORY.READING("Room availability retreived", ""));
      return result.length === dateIds.length;
    } catch (error) {
      logger.error(log.REPOSITORY.READING(`Error reading room availability: ${error}`, { error }));
      throw error;
    }
  }

  async getBookedDays(order: IOrderRequestDTO & { id: string }): Promise<number[]> {
    let bookedDaysID: { id: number }[] | null;

    try {
      bookedDaysID = await this.getDateIdsForRange(new Date(order.from), new Date(order.to));
      if (!bookedDaysID) {
        throw new Error("No dates found for the given range");
      }
      return bookedDaysID.map((date: any) => date.id);
    } catch (error) {
      logger.error(log.REPOSITORY.READING(`Error reading booked days for order with id ${order.id}`, "", error));
      throw error;
    }
  }
}

class WriteHotelRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async updateRoomAvailability(dateIds: number[], roomNumber: string): Promise<boolean> {
    let result: any | null;

    try {
      result = await prisma.room.updateMany({
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

      if (result) logger.info(log.REPOSITORY.WRITING("Room availability upadated", ""));
      else logger.warning(log.REPOSITORY.WRITING("Room avalability non updated", ""));
      return result ? true : false;
    } catch (error) {
      logger.error(log.REPOSITORY.WRITING(`Error updating room availability: ${error}`, { error }));
      throw error;
    }
  }

  async restoreRoomAvailability(dateIds: number[], roomNumber: string): Promise<boolean> {
    let result: any | null;

    try {
      result = await prisma.room.updateMany({
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

      if (result) logger.info(log.REPOSITORY.WRITING("Room availability restored", ""));
      else logger.warning(log.REPOSITORY.WRITING(`Room availability not restored`, ""));
      return result ? true : false;
    } catch (error) {
      logger.error(log.REPOSITORY.WRITING(`Restoring room availability: ${error}`, { error }));
      throw error;
    }
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
