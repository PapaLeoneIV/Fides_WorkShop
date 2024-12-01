import logger from '../config/logger';
import log  from "../config/logs";
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
    
      logger.info(log.REPOSITORY.READING(`Number of dirt bikes: ${dirtBikesCount._sum.dirt}`, ""));
      return dirtBikesCount._sum.dirt ?? 0;
    
    } catch (error) {
      logger.error(log.REPOSITORY.READING(`Error reading number of dirt bikes: ${error}`, "", { error }));
      return 0;
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
     
      logger.info(log.REPOSITORY.READING(`Number of road bikes: ${roadBikesCount._sum.road}`, ""));
      return roadBikesCount._sum.road ?? 0;
    
    } catch (error) {
      logger.error(log.REPOSITORY.READING(`Error reading number of road bikes: ${error}`, "", { error }));
      return 0;
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
      logger.info(log.REPOSITORY.WRITING(`Incremented bike count in the DB`, ""));
    } catch (error) {
      logger.error(log.REPOSITORY.WRITING(`Error incrementing bike count in the DB`, "", error));
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
      logger.info(log.REPOSITORY.WRITING(`Decremented bike count in the DB`, ""));
    } catch (error) {
      logger.error(log.REPOSITORY.WRITING(`Error decrementing bike count in the DB`, "", error));
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


