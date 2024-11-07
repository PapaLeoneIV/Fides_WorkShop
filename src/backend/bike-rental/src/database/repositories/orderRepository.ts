import { PrismaClient, order as OrderEntity } from "@prisma/client";
import BikeOrderDTO from "../../dtos/bikeOrder.dto";
// //import * as tsyringe from "tsyringe";
const prisma = new PrismaClient();

// @tsyringe.singleton()  
class OrderRepository {

    async create_order(bike_order: BikeOrderDTO): Promise<OrderEntity> {
        console.log(
            "[BIKE SERVICE]", "Creating new bike order in the DB with id: ",
            bike_order.order_id
        );
        let new_bike_order = await prisma.order.create({
            data: {
                userEmail: bike_order.userEmail,
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

    async update_order(bike_order: OrderEntity): Promise<OrderEntity> {
        console.log("[BIKE SERVICE]", "Updating bike ORDER with id: ", bike_order.order_id);
        let updated_bike_order = await prisma.order.update({
            where: {
                id: bike_order.id,
            },
            data: {
                userEmail: bike_order.userEmail,
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

    async update_status(bike_order: OrderEntity, status: string): Promise<OrderEntity> {
        console.log("[BIKE SERVICE]", "Updating order STATUS to", status);
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
        console.log("[BIKE SERVICE]", "Checking if bike order exists with id: ", order_id);
        const order =
            (await prisma.order.findFirst({
                where: {
                    order_id: order_id,
                },
            })) || null;
        if (!order) {
            console.log("[BIKE SERVICE]", 'Bike order with id', order_id,  'not found');
            return false;
        }
        return true;
    }

    async get_order_info(order_id: string): Promise<OrderEntity | null> {
        console.log("[BIKE SERVICE]", "Requsting order info : ", order_id);
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

    async delete_order(bike_order: OrderEntity) {
        console.log("[BIKE SERVICE]", "Deleting bike order with id: ", bike_order.order_id);
        await prisma.order.delete({
            where: {
                id: bike_order.id,
            },
        });
    }
}

export default OrderRepository;