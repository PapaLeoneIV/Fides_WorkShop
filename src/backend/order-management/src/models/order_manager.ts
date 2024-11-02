import { PrismaClient, order as OrderEntity } from "@prisma/client";
import { PENDING, APPROVED, CANCELLED } from "../config/status";
import {OrderRequestDTO} from "../dtos/OrderRequest.dto";
//import * as tsyringe from "tsyringe";

const prisma = new PrismaClient();



//@tsyringe.singleton()
class OrderManagerDB {
  constructor() {
  }

  async create_order(info: OrderRequestDTO): Promise<OrderEntity> {
    const x = await prisma.order.create({
      data : {
        from: info.from,
        to: info.to,
        room: info.room,
        road_bike_requested: info.road_bike_requested,
        dirt_bike_requested: info.dirt_bike_requested,
        amount: info.amount,
        bike_status: PENDING,
        hotel_status: PENDING,
        payment_status: PENDING,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    console.log("[ORDER MANAGER]Order created with id : ", x.id);
    return x;
  }

  async get_order(id: string): Promise<OrderEntity | null> {
    console.log("[ORDER MANAGER] Getting order with id: ", id);
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

  async update_bike_status(id: string, status: string): Promise<OrderEntity> {
    console.log("[ORDER MANAGER] Updating bike status with status: ", status);
   return  await prisma.order.update({
      where: {
        id: id,
      },
      data: {
        bike_status: status,
      },
    });
  }

  async update_hotel_status(id: string, status: string): Promise<OrderEntity> {
    console.log("[ORDER MANAGER] Updating hotel status with status: ", status);
    return await prisma.order.update({
      where: {
        id: id,
      },
      data: {
        hotel_status: status,
      },
    });
  }

  async update_payment_status(id: string, status: string): Promise<OrderEntity> {
    console.log("[ORDER MANAGER] Updating payment status with status: ", status);
    return await prisma.order.update({
      where: {
        id: id,
      },
      data: {
        payment_status: status,
      },
    });
  }

  async update_order(info: OrderEntity): Promise<OrderEntity> {
    console.log("[ORDER MANAGER] Updating order with id: ", info.id);
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
  async  order_still_pending(order: OrderEntity): Promise<boolean> {
    return order.bike_status === PENDING || order.hotel_status === PENDING
  }

  async order_completed(order: OrderEntity): Promise<boolean> {
    return order.bike_status === APPROVED && order.hotel_status === APPROVED && order.payment_status === PENDING
  }

  async order_needs_to_be_cancelled(order: OrderEntity): Promise<boolean> {
    return order.bike_status === CANCELLED && order.hotel_status === CANCELLED && order.payment_status !== CANCELLED
  }

  async check_approval(order: OrderEntity): Promise<boolean> {
    return order.bike_status === APPROVED && order.hotel_status === APPROVED && order.payment_status === APPROVED;
  }



}

export default OrderManagerDB;

