import { PrismaClient, order as OrderDO } from "@prisma/client";
const prisma = new PrismaClient();

export interface OrderDTO {
    order_id: string,
    to: string,
    from: string,
    room: string,
    renting_status: string,
    created_at: Date,
    updated_at: Date
}

export class HotelOrdersRepository {

    async create_order(hotel_order: OrderDTO): Promise<OrderDO> {
      console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "Creating new hotel order with id: ", hotel_order.order_id);
      const hotel = await prisma.order.create({
        data: {
          to: hotel_order.to,
          from: hotel_order.from,
          room: hotel_order.room,
          order_id: hotel_order.order_id,
          renting_status: hotel_order.renting_status,
          created_at: hotel_order.created_at,
          updated_at: hotel_order.updated_at,
        },
        
      });
      return hotel;
    }
    async check_existance(order_id: string): Promise<boolean> {
      console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "Checking if hotel order exists with id: ", order_id);
      const order =
        (await prisma.order.findFirst({
          where: {
            order_id: order_id,
          },
        })) || null;
      if (!order) {
        console.log(`[HOTEL SERVICE]Hotel order with id ${order_id} not found`);
        return false;
      }
      return true;
    }
  
  
    async get_order_info(order_id: string): Promise<OrderDO | null> {
      console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "Getting hotel order info with id: ", order_id);
      const order =
        (await prisma.order.findFirst({
          where: {
            order_id: order_id,
          },
        })) || null;
      if (!order) {
        console.log(`[HOTEL SERVICE]Hotel order with id ${order_id} not found`);
        return null;
      }
      return order;
    }
  
    async update_order(hotel_order: OrderDO): Promise<OrderDO> {
      console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "Updating hotel order with id: ", hotel_order.order_id);
      const updated_bike_order = await prisma.order.update({
        where: {
          id: hotel_order.id,
        },
        data: {
          to: hotel_order.to,
          from: hotel_order.from,
          room: hotel_order.room,
          order_id: hotel_order.order_id,
          renting_status: hotel_order.renting_status,
          created_at: hotel_order.created_at,
          updated_at: hotel_order.updated_at,
        },
      });
      return updated_bike_order;
    }
  
    async update_status(hotel_order: OrderDO, status: string): Promise<OrderDO> {
      console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "Updating hotel order status with status: ", status);
      const updated_hotel_order = await prisma.order.update({
        where: {
          id: hotel_order.id,
        },
        data: {
          renting_status: status,
        },
      });
      return updated_hotel_order;
    }
  
    async delete_order(hotel_order: OrderDTO) {
      console.log('\x1b[32m%s\x1b[0m', "[HOTEL SERVICE]", "Deleting hotel order with id: ", hotel_order.order_id);
      await prisma.order.delete({
        where: {
          id: hotel_order.order_id,
        },
      });
    }
  
  }