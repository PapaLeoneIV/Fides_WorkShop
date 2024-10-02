import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export interface bike_order {
  id: string;
  order_id: string;
  road_bike_requested: string;
  dirt_bike_requested: string;
  renting_status: string;
  created_at: Date;
  updated_at: Date;
}

export class BikeOrder {
  public info: bike_order;

  constructor(info: bike_order) {
    this.info = info;
    console.log("[BIKE SERVICE]Creating new bike order object with id: ", info.order_id);
  }

  public get id(): string {
    return this.info.id;
  }

  public get order_id(): string {
    return this.info.order_id;
  }

  public get road_bike_requested(): number {
    return parseInt(this.info.road_bike_requested, 10);
  }

  public get dirt_bike_requested(): number {
    return parseInt(this.info.dirt_bike_requested, 10);
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

export class BikeOrdersManager {

  async create_order(bike_order: bike_order): Promise<BikeOrder> {
    console.log(
      "[BIKE SERVICE]Creating new bike order in the DB with id: ",
      bike_order.order_id
    );
    const new_bike_order = await prisma.order.create({
      data: {
        road_bike_requested: bike_order.road_bike_requested,
        dirt_bike_requested: bike_order.dirt_bike_requested,
        order_id: bike_order.order_id,
        renting_status: bike_order.renting_status,
        created_at: bike_order.created_at,
        updated_at: bike_order.updated_at,
      },
    });
    return new BikeOrder(new_bike_order);
  }

  async update_order(bike_order: BikeOrder) {
    console.log("[BIKE SERVICE]Updating bike ORDER with id: ", bike_order.order_id);
    const updated_bike_order = await prisma.order.update({
      where: {
        id: bike_order.id,
      },
      data: {
        road_bike_requested: bike_order.info.road_bike_requested,
        dirt_bike_requested: bike_order.info.dirt_bike_requested,
        order_id: bike_order.info.order_id,
        renting_status: bike_order.info.renting_status,
        created_at: bike_order.info.created_at,
        updated_at: bike_order.info.updated_at,
      },
    });
    bike_order.info = updated_bike_order;
  }

  async update_status(bike_order: bike_order, status: string) {
    console.log("[BIKE SERVICE]Updating order STATUS to", status);
    const updated_bike_order = await prisma.order.update({
      where: {
        id: bike_order.id,
      },
      data: {
        renting_status: status,
      },
    });
    bike_order = updated_bike_order;
  }

  async check_existance(order_id: string): Promise<boolean> {
    console.log("[BIKE SERVICE]Checking if bike order exists with id: ", order_id);
    const order =
      (await prisma.order.findFirst({
        where: {
          order_id: order_id,
        },
      })) || null;
    if (!order) {
      console.log(`[BIKE SERVICE]Bike order with id ${order_id} not found`);
      return false;
    }
    return true;
  }

  async get_order_info(order_id: string): Promise<bike_order | null> {
    console.log("[BIKE SERVICE]Requsting order info : ", order_id);
    const order =
      (await prisma.order.findFirst({
        where: {
          order_id: order_id,
        },
      })) || null;
    if (!order) {
      console.log(`[BIKE SERVICE]Bike order with id ${order_id} not found`);
      return null;
    }
    return order;
  }

  async delete_order(bike_order: BikeOrder) {
    console.log("[BIKE SERVICE]Deleting bike order with id: ", bike_order.order_id);
    await prisma.order.delete({
      where: {
        id: bike_order.id,
      },
    });
  }
}

export class BikeDBManager {


  async getNumberOfRoadBikes(): Promise<number> {
    console.log("[BIKE SERVICE]Requesting number of road bikes from DB");
    const road_bikes_count = await prisma.bikes.aggregate({
      _sum: {
        road: true,
      },
    });
    return road_bikes_count._sum.road ?? 0;
  }

  async getNumberOfDirtBikes(): Promise<number> {
    console.log("[BIKE SERVICE]Requesting number of dirt bikes from database");
    const dirt_bikes_count = await prisma.bikes.aggregate({
      _sum: {
        dirt: true,
      },
    });
    return dirt_bikes_count._sum.dirt ?? 0;
  }

  async incrementBikeCount(road_bikes: number, dirt_bikes: number) {
    console.log("[BIKE SERVICE]Incrementing the bike count in the DB");
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

  async decrementBikeCount(road_bikes: number, dirt_bikes: number) {
    console.log("[BIKE SERVICE]Decrementing bike count in the DB");
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
