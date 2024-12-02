import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import logger from "../config/logger";
import log from "../config/logs";
import { PrismaClient, order as OrderEntity } from "@prisma/client";
import { OrderStatus as status } from "../config/OrderStatus";
import IFrontendRequestDTO from "../dtos/IFrontendRequestDTO";

class ReadOrderRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getOrder(id: string): Promise<(IFrontendRequestDTO & { id: string }) | null> {
    try {
      return (await prisma.order.findFirst({
        where: {
          id: id,
        },
      })) as (IFrontendRequestDTO & { id: string }) | null;
    } catch (error) {
      logger.error(log.REPOSITORY.READING(`Error reading order with id ${id}`,error));
      return null;
    }
  }

  async isPending(order: OrderEntity): Promise<boolean> {
    return order.bike_status === status.PENDING || order.hotel_status === status.PENDING;
  }

  async isCompleted(order: OrderEntity): Promise<boolean> {
    return (
      order.bike_status === status.APPROVED &&
      order.hotel_status === status.APPROVED &&
      order.payment_status === status.PENDING
    );
  }

  async needsCancellation(order: OrderEntity): Promise<boolean> {
    return (
      order.bike_status === status.CANCELLED &&
      order.hotel_status === status.CANCELLED &&
      order.payment_status !== status.CANCELLED
    );
  }

  async isApproved(order: OrderEntity): Promise<boolean> {
    return (
      order.bike_status === status.APPROVED &&
      order.hotel_status === status.APPROVED &&
      order.payment_status === status.APPROVED
    );
  }

  async isCancelled(order: OrderEntity): Promise<boolean> {
    return (
      order.bike_status === status.CANCELLED &&
      order.hotel_status === status.CANCELLED &&
      order.payment_status === status.CANCELLED
    );
  }
}

class WriteOrderRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createOrder(request: IFrontendRequestDTO): Promise<IFrontendRequestDTO & { id: string } | null> {
    try {
      const order = await prisma.order.create({
        data: {
          userEmail: request.userEmail,
          from: request.from,
          to: request.to,
          room: request.room,
          road_bike_requested: request.road_bike_requested,
          dirt_bike_requested: request.dirt_bike_requested,
          amount: request.amount,
          bike_status: status.PENDING,
          hotel_status: status.PENDING,
          payment_status: status.PENDING,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      logger.info(log.REPOSITORY.WRITING(`Order with id: ${order.id} created`,order));
      return order as IFrontendRequestDTO & { id: string };
    } catch (error) {
      logger.error(log.REPOSITORY.WRITING("Error creating order",error));
      return null;
    }
  }

  async updateBikeStatus(id: string, status: string): Promise<IFrontendRequestDTO & { id: string }> {
    try {
      const order = await prisma.order.update({
        where: {
          id: id,
        },
        data: {
          bike_status: status,
        },
      });
      logger.info(log.REPOSITORY.WRITING(`Bike status updated with status: ${status}`,order));
      return order as IFrontendRequestDTO & { id: string };
    } catch (error) {
      logger.error(log.REPOSITORY.WRITING("Error updating bike status",error));
      throw new Error(HTTPerror.INTERNAL_SERVER_ERROR.message);
    }
  }

  async updateHotelStatus(id: string, status: string): Promise<(IFrontendRequestDTO & { id: string }) | null> {
    try {
      const order = await prisma.order.update({
        where: {
          id: id,
        },
        data: {
          hotel_status: status,
        },
      });
      logger.info(log.REPOSITORY.WRITING(`Hotel status updated with status: ${status}`,order));
      return order as IFrontendRequestDTO & { id: string };
    } catch (error) {
      logger.error(log.REPOSITORY.WRITING("Error updating hotel status",error));
      return null;
    }
  }

  async updatePaymentStatus(id: string, status: string): Promise<(IFrontendRequestDTO & { id: string }) | null> {
    try {
      const order = await prisma.order.update({
        where: {
          id: id,
        },
        data: {
          payment_status: status,
        },
      });
      logger.info(log.REPOSITORY.WRITING(`Payment status updated with status: ${status}`,order));
      return order as IFrontendRequestDTO & { id: string };
    } catch (error) {
      logger.error(log.REPOSITORY.WRITING("Error updating payment status",error));
      return null;
    }
  }

  // async updateStatus( id: string, status: string, service: string ): Promise<IFrontendRequestDTO & { id: string }> {
  //   try {
  //     const data: any = {};

  //     switch (service) {
  //       case "hotel":
  //         data.hotel_status = status;
  //         break;
  //       case "bike":
  //         data.bike_status = status;
  //         break;
  //       case "payment":
  //         data.payment_status = status;
  //         break;
  //       default:
  //         throw new Error("Invalid service");
  //     }

  //     const order = await prisma.order.update({
  //       where: {
  //         id: id,
  //       },
  //       data: data,
  //     });
  //     logger.info(log.REPOSITORY.WRITING(`Hotel status updated with status: ${status}`,order));
  //     return order;
  //   } catch (error) {
  //     logger.error(log.REPOSITORY.WRITING("Error updating hotel status",error));
  //     throw new Error(HTTPerror.INTERNAL_SERVER_ERROR.message);
  //   }
  // }

  // async updateOrder(update: IFrontendRequestDTO & { id: string }): Promise<IFrontendRequestDTO & { id: string }> {
  //   try {
  //     const order =  await prisma.order.update({
  //       where: {
  //         id: update.id,
  //       },
  //       data: {
  //         userEmail: update.userEmail,

  //         to: update.to,
  //         from: update.from,
  //         room: update.room,

  //         road_bike_requested: update.road_bike_requested,
  //         dirt_bike_requested: update.dirt_bike_requested,

  //         amount: update.amount,

  //         bike_status: update.bike_status,
  //         hotel_status: update.hotel_status,
  //         payment_status: update.payment_status,

  //         created_at: update.created_at,
  //         updated_at: new Date(),
  //       },
  //     });
  //     logger.info(log.REPOSITORY.WRITING(`Order with id: ${order.id} updated`,order));
  //     return order as IFrontendRequestDTO & { id: string };
  //   } catch (error) {
  //     logger.error(log.REPOSITORY.WRITING("Error updating order",error));
  //     throw new Error(HTTPerror.INTERNAL_SERVER_ERROR.message);
  //   }
}

//@tsyringe.singleton()
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
