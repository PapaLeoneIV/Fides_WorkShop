import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()

interface BikeRequested {
    road: String;
    dirt: String;
  }

export const check_bikes_availability = async (req : BikeRequested) => {
    return true;
}
