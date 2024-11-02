import { order as HotelEntity, PrismaClient } from "@prisma/client";
//import * as tsyringe from "tsyringe";

const prisma = new PrismaClient();


//@tsyringe.singleton()
class HotelDBRepository {

    async getDateIdsForRange (from: Date, to: Date): Promise<any> {
      console.log("[HOTEL SERVICE] Getting date ids for range: ", from, to);
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
      console.log("[HOTEL SERVICE] Checking if", roomNumber,"is available for the selected dates");
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
      console.log("[HOTEL SERVICE] Updating room availability for room ", roomNumber);
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
        console.log("[HOTEL SERVICE] Room updated successfully!")
      else
        console.log("[HOTEL SERVICE] Room did not update sucessfully!")
    };
  
    async restoreRoomAvailability ( dateIds: number[], roomNumber: string): Promise<boolean> {
      console.log("[HOTEL SERVICE] Restoring room availability for room ", roomNumber);
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

    async getBookedDays(order: HotelEntity): Promise<number[]> {
      let bookedDaysID =  await this.getDateIdsForRange(new Date(order.from), new Date(order.to));
      return bookedDaysID.map((date: any) => date.id);
    }
  }
  

  export default HotelDBRepository;