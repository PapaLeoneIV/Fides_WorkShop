import { PrismaClient, order as OrderDO } from "@prisma/client";
const prisma = new PrismaClient();

export interface OrderDTO {
  from: string;
  to: string;
  room: string;
  amount: string;
  road_bike_requested: number;
  dirt_bike_requested: number;
  bike_status: string;
  hotel_status: string;
  payment_status: string;
  created_at: Date;
  updated_at: Date;
}



export class OrderManagerDB {

  async create_order(info: OrderDTO): Promise<OrderDO> {
    const x = await prisma.order.create({
      data : {
        from: info.from,
        to: info.to,
        room: info.room,
        road_bike_requested: info.road_bike_requested,
        dirt_bike_requested: info.dirt_bike_requested,
        amount: info.amount,
        bike_status: "PENDING",
        hotel_status: "PENDING",
        payment_status: "PENDING",
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    console.log("[ORDER MANAGER]Order created with id : ", x.id);
    return x;
  }

  async get_order(id: string): Promise<OrderDO | null> {
    console.log("[ORDER MANAGER]", "Getting order with id: ", id);
    return  await prisma.order.findFirst({
      where: {
        id: id,
      },
    });
  }

  async check_existance(id: string): Promise<boolean> {
    console.log("[ORDER MANAGER]Checking if order exists with id: ", id);
    const order = await prisma.order.findFirst({
      where: {
        id: id,
      },
    });
    if (!order) {
      console.log(`Order with id ${id} not found`);
      return false;
    }
    return true;
  }

  async update_bike_status(id: string, status: string): Promise<OrderDO> {
    console.log("[ORDER MANAGER]", "Updating bike status with status: ", status);
   return  await prisma.order.update({
      where: {
        id: id,
      },
      data: {
        bike_status: status,
      },
    });
  }

  async update_hotel_status(id: string, status: string): Promise<OrderDO> {
    console.log("[ORDER MANAGER]", "Updating hotel status with status: ", status);
    return await prisma.order.update({
      where: {
        id: id,
      },
      data: {
        hotel_status: status,
      },
    });
  }

  async update_payment_status(id: string, status: string): Promise<OrderDO> {
    console.log("[ORDER MANAGER]", "Updating payment status with status: ", status);
    return await prisma.order.update({
      where: {
        id: id,
      },
      data: {
        payment_status: status,
      },
    });
  }

  async update_order(info: OrderDO): Promise<OrderDO> {
    console.log("[ORDER MANAGER]", "Updating order with id: ", info.id);
    return await prisma.order.update({
      where: {
        id: info.id,
      },
      data: {
        to: info.to,
        from: info.from,
        room: info.room,

        road_bike_requested: info.road_bike_requested,
        dirt_bike_requested: info.dirt_bike_requested,

        amount: info.amount,

        bike_status: info.bike_status,
        hotel_status: info.hotel_status,
        payment_status: info.payment_status,

        created_at: info.created_at,
        updated_at: new Date(),
      },
    });
  }
}