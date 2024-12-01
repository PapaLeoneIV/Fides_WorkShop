import logger from "../config/logger";
import log from "../config/logs";
import { PrismaClient } from "@prisma/client";
import IOrderRequestDTO from "../dtos/IOrderRequestDTO";

class ReadOrderRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async checkExistance(order_id: string): Promise<boolean> {
    let order: (IOrderRequestDTO & { id: string }) | null;

    try {
      order = await prisma.order.findFirst({
        where: {
          order_id: order_id,
        },
      });

      if (order) logger.info(log.REPOSITORY.READING(`Hotel order with id ${order_id} exists`, "", { order_id }));
      else logger.warning(log.REPOSITORY.READING(`Hotel order with id ${order_id} does not exist`, "", { order_id }));
      return order ? true : false;
    } catch (error) {
      logger.error(log.REPOSITORY.READING(`Unable to read for hotel order exhistance: ${error}`, { error }));
      throw error;
    }
  }

  async getOrderInfo(order_id: string): Promise<(IOrderRequestDTO & { id: string }) | null> {
    let order: (IOrderRequestDTO & { id: string }) | null;

    try {
      order = await prisma.order.findFirst({
        where: {
          order_id: order_id,
        },
      });

      if (!order) throw new Error(`Hotel order with id ${order_id} not found`);
      logger.info(log.REPOSITORY.READING(`Hotel order with id ${order_id} found`, "", { order_id }));
      return order;
    } catch (error) {
      //TODO: move all the logging format
      logger.error(log.REPOSITORY.READING(`Unable to read hotel order info ${order_id}: ${error}`, "", { error }));
      throw error;
    }
  }
}

class WriteOrderRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createOrder(hotel_order: IOrderRequestDTO): Promise<IOrderRequestDTO & { id: string }> {
    let order: IOrderRequestDTO & { id: string };

    try {
      order = await prisma.order.create({
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
      logger.info(log.REPOSITORY.WRITING(`Hotel order with id ${hotel_order.order_id} created`, "", { hotel_order }));
      return order;
    } catch (error) {
      logger.error(log.REPOSITORY.WRITING(`Error creating bike order: ${error}`, "", { error }));
      throw error;
    }
  }

  async updateOrderStatus(id: string, status: string): Promise<IOrderRequestDTO & { id: string }> {
    let order: (IOrderRequestDTO & { id: string }) | null;

    try {
      order = await prisma.order.update({
        where: {
          id: id,
        },
        data: {
          renting_status: status,
        },
      });

      logger.info(log.REPOSITORY.WRITING(`Hotel order ${order.order_id} status updated to ${status}`, "", { order }));
      return order;
    } catch (error) {
      logger.error(log.REPOSITORY.WRITING(`Error updating hotel order status: ${error}`, "", { error }));
      throw error;
    }
  }
  // UNUSED
  // async updateOrder(hotel_order: IOrderRequestDTO & { id: string }): Promise<IOrderRequestDTO & { id: string}> {
  //   logger.info("[HOTEL SERVICE] Updating hotel order with id: ", hotel_order.order_id);
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
  //   logger.info("[HOTEL SERVICE] Deleting hotel order with id: ", hotel_order.order_id);
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
