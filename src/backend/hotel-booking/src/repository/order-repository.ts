import { Messages as message } from "../config/Messages";
import { PrismaClient } from "@prisma/client";
import IOrderRequestDTO from "../dtos/IOrderRequestDTO";

class ReadOrderRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async checkExistance(order_id: string): Promise<boolean> {
    console.log(message.REPOSITORY.DEBUG.READING_DATA(`Checking if hotel order exists with id: ${order_id}`, "", {order_id}).message);
    const order = (await prisma.order.findFirst({
        where: {
          order_id: order_id,
        },
      })) || null;
    if (!order) {
      console.log(message.REPOSITORY.WARNING.READING_DATA(`Hotel order with id ${order_id} does not exist`, "", {order_id}).message);
      return false;
    }
    console.log(message.REPOSITORY.INFO.READING_DATA(`Hotel order with id ${order_id} exists`, "", {order_id}).message);
    return true;
  }

  async getOrderInfo(order_id: string): Promise<IOrderRequestDTO & { id: string } | null> {
    console.log(message.REPOSITORY.DEBUG.READING_DATA(`Getting hotel order info with id: ${order_id}`, "", {order_id}).message);
    let order = (await prisma.order.findFirst({
        where: {
          order_id: order_id,
        },
      })) || null;
    if (!order) {
      console.log(message.REPOSITORY.WARNING.READING_DATA(`Hotel order with id ${order_id} not found`, "", {order_id}).message);
      return null;
    }
    console.log(message.REPOSITORY.INFO.READING_DATA(`Hotel order with id ${order_id} found`, "", {order_id}).message);
    return order;
  }
}

class WriteOrderRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createOrder(hotel_order: IOrderRequestDTO): Promise<IOrderRequestDTO & { id: string }> {
    console.log(message.REPOSITORY.DEBUG.WRITING_DATA(`Creating new hotel order with order_id: ${hotel_order.order_id}`, "", {hotel_order}).message);
    const hotel = await prisma.order.create({
      data: {
        userEmail: hotel_order.userEmail,
        to: hotel_order.to,
        from: hotel_order.from,
        room: hotel_order.room,
        order_id: hotel_order.order_id,
        renting_status: hotel_order.renting_status,
        created_at: hotel_order.created_at,
        updated_at: hotel_order.updated_at,
      },
    });
    console.log(message.REPOSITORY.INFO.WRITING_DATA(`Hotel order with id ${hotel_order.order_id} created`, "", {hotel_order}).message);
    return hotel;
  }

  async updateOrderStatus(hotel_order: IOrderRequestDTO & { id: string }, status: string): Promise<IOrderRequestDTO & { id: string }> {
    console.log(message.REPOSITORY.DEBUG.WRITING_DATA(`Updating hotel order with id: ${hotel_order.order_id}`, "", {hotel_order}).message);
    const updated_hotel_order = await prisma.order.update({
      where: {
        id: hotel_order.id,
      },
      data: {
        renting_status: status,
      },
    });
    console.log(message.REPOSITORY.INFO.WRITING_DATA(`Hotel order with id ${hotel_order.order_id} updated`, "", {hotel_order}).message);
    return updated_hotel_order;
  }

  // UNUSED
  // async updateOrder(hotel_order: IOrderRequestDTO & { id: string }): Promise<IOrderRequestDTO & { id: string}> {
  //   console.log("[HOTEL SERVICE] Updating hotel order with id: ", hotel_order.order_id);
  //   const updated_bike_order = await prisma.order.update({
  //     where: {
  //       id: hotel_order.id,
  //     },
  //     data: {
  //       userEmail: hotel_order.userEmail,
  //       to: hotel_order.to,
  //       from: hotel_order.from,
  //       room: hotel_order.room,
  //       order_id: hotel_order.order_id,
  //       renting_status: hotel_order.renting_status,
  //       created_at: hotel_order.created_at,
  //       updated_at: hotel_order.updated_at,
  //     },
  //   });
  //   return updated_bike_order;
  // }

  // async deleteOrder(hotel_order: IOrderRequestDTO & { id: string }): Promise<void> {
  //   console.log("[HOTEL SERVICE] Deleting hotel order with id: ", hotel_order.order_id);
  //   await prisma.order.delete({
  //     where: {
  //       id: hotel_order.id,
  //     },
  //   });
  // }
}

class OrderRepository {
  public read: ReadOrderRepository;
  public write: WriteOrderRepository;

  constructor(prisma: PrismaClient) {
    this.read = new ReadOrderRepository(prisma);
    this.write = new WriteOrderRepository(prisma);
  }
}

const prisma = new PrismaClient();
export const orderRepository = new OrderRepository(prisma);