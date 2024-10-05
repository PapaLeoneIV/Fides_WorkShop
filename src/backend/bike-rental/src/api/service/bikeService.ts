import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export interface bikeDO {
  id: string;
  order_id: string;
  road_bike_requested: number;
  dirt_bike_requested: number;
  renting_status: string;
  created_at: Date;
  updated_at: Date;
}

export class BikeOrderRepository {

  async create_order(bike_order: bikeDO): Promise<bikeDO> {
    console.log(
      '\x1b[36m%s\x1b[0m', "[BIKE SERVICE]", "Creating new bike order in the DB with id: ",
      bike_order.order_id
    );
    let new_bike_order = await prisma.order.create({
      data: {
        road_bike_requested: bike_order.road_bike_requested,
        dirt_bike_requested: bike_order.dirt_bike_requested,
        order_id: bike_order.order_id,
        renting_status: bike_order.renting_status,
        created_at: bike_order.created_at,
        updated_at: bike_order.updated_at,
      },
    });
    return new_bike_order
  }

  async update_order(bike_order: bikeDO) {
    console.log('\x1b[36m%s\x1b[0m', "[BIKE SERVICE]", "Updating bike ORDER with id: ", bike_order.order_id);
    let updated_bike_order = await prisma.order.update({
      where: {
        id: bike_order.id,
      },
      data: {
        road_bike_requested: bike_order.road_bike_requested,
        dirt_bike_requested: bike_order.dirt_bike_requested,
        order_id: bike_order.order_id,
        renting_status: bike_order.renting_status,
        created_at: bike_order.created_at,
        updated_at: bike_order.updated_at,
      },
    });
    return updated_bike_order;
  }

  async update_status(bike_order: bikeDO, status: string) : Promise<bikeDO> {
    console.log('\x1b[36m%s\x1b[0m', "[BIKE SERVICE]", "Updating order STATUS to", status);
    let updated_bike_order = await prisma.order.update({
      where: {
        id: bike_order.id,
      },
      data: {
        renting_status: status,
      },
    });
    return updated_bike_order;
  }

  async check_existance(order_id: string): Promise<boolean> {
    console.log('\x1b[36m%s\x1b[0m', "[BIKE SERVICE]", "Checking if bike order exists with id: ", order_id);
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

  async get_order_info(order_id: string): Promise<bikeDO | null> {
    console.log('\x1b[36m%s\x1b[0m', "[BIKE SERVICE]", "Requsting order info : ", order_id);
    let order =
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

  async delete_order(bike_order: bikeDO) {
    console.log('\x1b[36m%s\x1b[0m', "[BIKE SERVICE]", "Deleting bike order with id: ", bike_order.order_id);
    await prisma.order.delete({
      where: {
        id: bike_order.id,
      },
    });
  }
}

export class BikeDBManager {


  async get_number_road_bikes(): Promise<number> {
    console.log('\x1b[36m%s\x1b[0m', "[BIKE SERVICE]", "Requesting number of road bikes from DB");
    const road_bikes_count = await prisma.bikes.aggregate({
      _sum: {
        road: true,
      },
    });
    return road_bikes_count._sum.road ?? 0;
  }

  async get_number_dirt_bikes(): Promise<number> {
    console.log('\x1b[36m%s\x1b[0m', "[BIKE SERVICE]", "Requesting number of dirt bikes from database");
    const dirt_bikes_count = await prisma.bikes.aggregate({
      _sum: {
        dirt: true,
      },
    });
    return dirt_bikes_count._sum.dirt ?? 0;
  }

  async increment_bike_count(road_bikes: number, dirt_bikes: number) {
    console.log('\x1b[36m%s\x1b[0m', "[BIKE SERVICE]", "Incrementing the bike count in the DB");
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
    console.log('\x1b[36m%s\x1b[0m', "[BIKE SERVICE]", "Decrementing bike count in the DB");
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
