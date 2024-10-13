import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export class BikeDBRepository {


    async get_number_road_bikes(): Promise<number> {
      console.log("[BIKE SERVICE]", "Requesting number of road bikes from DB");
      const road_bikes_count = await prisma.bikes.aggregate({
        _sum: {
          road: true,
        },
      });
      return road_bikes_count._sum.road ?? 0;
    }
  
    async get_number_dirt_bikes(): Promise<number> {
      console.log("[BIKE SERVICE]", "Requesting number of dirt bikes from database");
      const dirt_bikes_count = await prisma.bikes.aggregate({
        _sum: {
          dirt: true,
        },
      });
      return dirt_bikes_count._sum.dirt ?? 0;
    }
  
    async increment_bike_count(road_bikes: number, dirt_bikes: number) {
      console.log("[BIKE SERVICE]", "Incrementing the bike count in the DB");
      await prisma.bikes.updateMany({
        data: {
          road: {
            increment: road_bikes,
          },
          dirt: {
            increment: dirt_bikes,
          },
        },
      });
    }
  
    async decrement_bike_count(road_bikes: number, dirt_bikes: number) {
      console.log("[BIKE SERVICE]", "Decrementing bike count in the DB");
      await prisma.bikes.updateMany({
        data: {
          road: {
            decrement: road_bikes,
          },
          dirt: {
            decrement: dirt_bikes,
          },
        },
      });
    }
  }
  