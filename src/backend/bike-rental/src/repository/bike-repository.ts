import { PrismaClient } from "@prisma/client";

class ReadBikeRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getNumberDirtBikes(): Promise<number> {
    console.log("[repository]", "Requesting number of dirt bikes from database");
    const dirtBikesCount = await this.prisma.bikes.aggregate({
      _sum: {
        dirt: true,
      },
    });
    return dirtBikesCount._sum.dirt ?? 0;
  }

  async getNumberRoadBikes(): Promise<number> {
    console.log("[repository]", "Requesting number of road bikes from DB");
    const roadBikesCount = await this.prisma.bikes.aggregate({
      _sum: {
        road: true,
      },
    });
    return roadBikesCount._sum.road ?? 0;
  }

  async checkAvailability(road_bikes: number, dirt_bikes: number): Promise<boolean> {
    console.log("[repository]", "Checking bike availability in the DB");
    const availableDirtBikes = await this.getNumberDirtBikes();
    const availableRoadBikes = await this.getNumberRoadBikes();
    return (
      availableDirtBikes >= dirt_bikes &&
      availableRoadBikes >= road_bikes
    );
  }
}

class WriteBikeRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async incrementBikeCount(roadBikes: number, dirtBikes: number) {
    console.log("[repository]", "Incrementing the bike count in the DB");
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
  }

  async decrementBikeCount(roadBikes: number, dirtBikes: number) {
    console.log("[repository]", "Decrementing bike count in the DB");
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


