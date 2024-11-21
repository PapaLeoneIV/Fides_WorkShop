import { Messages as log } from "../config/Messages";
import { PrismaClient } from "@prisma/client";

class ReadBikeRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private async getNumberDirtBikes(): Promise<number> {
    let dirtBikesCount: any;

    try {
      dirtBikesCount = await this.prisma.bikes.aggregate({
        _sum: {
          dirt: true,
        },
      });
    
      console.log(log.REPOSITORY.INFO.READING(`Number of dirt bikes: ${dirtBikesCount._sum.dirt}`, ""));
      return dirtBikesCount._sum.dirt ?? 0;
    
    } catch (error) {
      console.error(log.REPOSITORY.ERROR.READING(`Error reading number of dirt bikes: ${error}`, "", { error }));
      throw error;
    }
  }

  private async getNumberRoadBikes(): Promise<number> {
    let roadBikesCount: any;

    try {
      roadBikesCount = await this.prisma.bikes.aggregate({
        _sum: {
          road: true,
        },
      });
     
      console.log(log.REPOSITORY.INFO.READING(`Number of road bikes: ${roadBikesCount._sum.road}`, ""));
      return roadBikesCount._sum.road ?? 0;
    
    } catch (error) {
      console.error(log.REPOSITORY.ERROR.READING(`Error reading number of road bikes: ${error}`, "", { error }));
      throw error;
    }
  }

  async checkAvailability(road_bikes: number, dirt_bikes: number): Promise<boolean> {
    //TODO: do I really need a try catch here?
    try {
      const availableDirtBikes = await this.getNumberDirtBikes();
      const availableRoadBikes = await this.getNumberRoadBikes();
      return (
        availableDirtBikes >= dirt_bikes &&
        availableRoadBikes >= road_bikes
      );
    } catch (error) {
      throw error;
    }
  }
}

class WriteBikeRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async incrementBikeCount(roadBikes: number, dirtBikes: number) {
    try {
      await this.prisma.bikes.updateMany({
        data: {
          road: {
            increment: roadBikes,
          },
          dirt: {
            increment: dirtBikes,
          },
        },
      });
      console.log(log.REPOSITORY.INFO.WRITING(`Incremented bike count in the DB`, ""));
    } catch (error) {
      console.error(log.REPOSITORY.ERROR.WRITING(`Error incrementing bike count in the DB`, "", error));
      throw error;
    }
  }

  async decrementBikeCount(roadBikes: number, dirtBikes: number) {
    try {
      await this.prisma.bikes.updateMany({
        data: {
          road: {
            decrement: roadBikes,
          },
          dirt: {
            decrement: dirtBikes,
          },
        },
      });
      console.log(log.REPOSITORY.INFO.WRITING(`Decremented bike count in the DB`, ""));
    } catch (error) {
      console.error(log.REPOSITORY.ERROR.WRITING(`Error decrementing bike count in the DB`, "", error));
      throw error;
    }
  }
}

class BikeRepository {
  public read: ReadBikeRepository;
  public write: WriteBikeRepository;

  constructor(prisma: PrismaClient) {
    this.read = new ReadBikeRepository(prisma);
    this.write = new WriteBikeRepository(prisma);
  }
}

const prisma = new PrismaClient();
export const bikeRepository = new BikeRepository(prisma);


