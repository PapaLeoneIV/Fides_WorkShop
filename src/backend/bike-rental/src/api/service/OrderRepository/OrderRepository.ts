import { PrismaClient, order as OrderDO} from "@prisma/client";
const prisma = new PrismaClient();

export interface OrderDTO {
    order_id: string,
    road_bike_requested: number,
    dirt_bike_requested: number,
    renting_status: string,
    created_at: Date,
    updated_at: Date
  }
  

export class BikeOrderRepository {

    async create_order(bike_order: OrderDTO): Promise<OrderDO> {
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

    async update_order(bike_order: OrderDO) {
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

    async update_status(bike_order: OrderDO, status: string): Promise<OrderDO> {
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
            console.log('\x1b[36m%s\x1b[0m',"[BIKE SERVICE]", 'Bike order with id', order_id,  'not found');
            return false;
        }
        return true;
    }

    async get_order_info(order_id: string): Promise<OrderDO | null> {
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

    async delete_order(bike_order: OrderDO) {
        console.log('\x1b[36m%s\x1b[0m', "[BIKE SERVICE]", "Deleting bike order with id: ", bike_order.order_id);
        await prisma.order.delete({
            where: {
                id: bike_order.id,
            },
        });
    }
}