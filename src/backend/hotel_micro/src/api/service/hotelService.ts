import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

interface HotelRequest {
  to: string;
  from: string;
  room: string;
}

const getDateIdsForRange = async (from: Date, to: Date) => {
  return await prisma.date.findMany({
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
};

const areRoomsAvailable = async (dateIds: number[], roomNumber: string) => {
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

const updateRoomAvailability = async (
  dateIds: number[],
  roomNumber: string
) => {
  return await prisma.room.updateMany({
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
};

export const check_hotel_availability = async (
  req: HotelRequest
): Promise<boolean> => {
  try {
    const startDate = new Date(req.from);
    const endDate = new Date(req.to);
    const roomNumber = req.room;

    const dateRecords = await getDateIdsForRange(startDate, endDate);
    const dateIds = dateRecords.map((date) => date.id);

    if (dateIds.length === 0) {
      console.log("No dates found for the requested range.");
      return false;
    }

    const roomsAvailable = await areRoomsAvailable(dateIds, roomNumber);

    if (!roomsAvailable) {
      console.log("Room is not available for the entire date range.");
      return false;
    }

    await updateRoomAvailability(dateIds, roomNumber);
    console.log(`Room ${roomNumber} has been successfully booked.`);
    return true;
  } catch (error) {
    console.log("An error occurred while checking hotel availability: ", error);
    return false;
  }
};

export const revert_hotel_order = async (
  req: HotelRequest
): Promise<boolean> => {
  try {
    const startDate = new Date(req.from);
    const endDate = new Date(req.to);
    const roomNumber = req.room;

    const dateRecords = await getDateIdsForRange(startDate, endDate);
    const dateIds = dateRecords.map((date) => date.id);

    if (dateIds.length === 0) {
      console.log("No dates found for the requested range.");
      return false;
    }

    await prisma.room.updateMany({
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

    console.log(`Room ${roomNumber} has been successfully reverted.`);
    return true;
  } catch (error) {
    console.log("An error occurred while reverting hotel order: ", error);
    return false;
  }
};
