import logger from '../config/logger';
import log  from "../config/logs";
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

      if (order) logger.info(log.REPOSITORY.READING(`Bike order with id ${order_id} exists`,{ order_id }));
      else
        logger.info(log.REPOSITORY.READING(`Bike order with id ${order_id} does not exist`,{ order_id }));
      return order ? true : false;
    } catch (error) {
      logger.info(log.REPOSITORY.READING(`Unable to read for bike order exhistance`,error));
      return false;
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
      logger.info(log.REPOSITORY.READING(`Hotel order with id ${order_id} found`,{ order_id }));
      return order;
    } catch (error) {
      //TODO: move all the logging format
      logger.info(log.REPOSITORY.READING(`Unable to read hotel order info ${order_id}`,{ order_id }));
      return null;
    }
  }
}

class WriteOrderRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createOrder(bike_order: IOrderRequestDTO): Promise<IOrderRequestDTO & { id: string } | null> {
    let order: IOrderRequestDTO & { id: string };
    try {
      order = await prisma.order.create({
        data: {
          order_id: bike_order.order_id,
          userEmail: bike_order.userEmail,
          road_bike_requested: bike_order.road_bike_requested,
          dirt_bike_requested: bike_order.dirt_bike_requested,
          renting_status: bike_order.renting_status,
          created_at: bike_order.created_at,
          updated_at: bike_order.updated_at,
        },
      });
      logger.info(log.REPOSITORY.WRITING(`Bike order with id ${bike_order.order_id} created`,{ bike_order }));
      return order;
    } catch (error) {
      logger.error(log.REPOSITORY.WRITING(`Error creating bike order: ${error}`,{ error }));
      return null;
    }
  }

  async updateStatus(id: string, status: string): Promise<IOrderRequestDTO & { id: string } | null> {
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
        logger.info(log.REPOSITORY.WRITING(`Bike order ${order.order_id} status updated with status: ${status}`,{ order }));
      return order;
    } catch (error) {
      logger.error(log.REPOSITORY.WRITING(`Error updating bike order status: ${error}`,{ error }));
      return null;
    }
  }

  // UNUSED
  // async updateOrder(bike_order: IOrderRequestDTO & { id: number }): Promise<IOrderRequestDTO & { id: number }> {
  //     logger.info("[repository]", "Updating bike ORDER with id: ", bike_order.order_id);
  //     let updated_bike_order = await prisma.order.update({
  //         where: {
  //             id: bike_order.id,
  //         },
  //         data: {
  //             userEmail: bike_order.userEmail,
  //             road_bike_requested: bike_order.road_bike_requested,
  //             dirt_bike_requested: bike_order.dirt_bike_requested,
  //             order_id: bike_order.order_id,
  //             renting_status: bike_order.renting_status,
  //             created_at: bike_order.created_at,
  //             updated_at: bike_order.updated_at,
  //         },
  //     });
  //     return { ...bike_order, id: updated_bike_order.id }
  // }
  // async deleteOrder(bike_order: IOrderRequestDTO & { id: number }): Promise<void> {
  //     logger.info("[repository]", "Deleting bike order with id: ", bike_order.order_id);
  //     await prisma.order.delete({
  //         where: {
  //             id: bike_order.id,
  //         },
  //     });
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
