import { PrismaClient } from "@prisma/client";
import IOrderRequestDTO from "../dtos/IOrderRequestDTO";

//TODO: Implement try-catch blocks for error handling
class ReadOrderRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async checkExistance(order_id: string): Promise<boolean> {
        console.log("[repository]", "Checking if bike order exists with id: ", order_id);
        const order =
            (await prisma.order.findFirst({
                where: {
                    order_id: order_id,
                },
            })) || null;
        if (!order) {
            console.log("[repository]", 'Bike order with id', order_id, 'not found');
            return false;
        }
        return true;
    }

    async getOrderInfo(order_id: string): Promise<IOrderRequestDTO & { id: number } | null> {
        console.log("[repository]", "Requsting order info : ", order_id);
        let order =
            (await prisma.order.findFirst({
                where: {
                    order_id: order_id,
                },
            })) || null;
        if (!order) {
            console.log(`[repository] Bike order with id ${order_id} not found`);
            return null;
        }
        return order;
    }
}

class WriteOrderRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async createOrder(bike_order: IOrderRequestDTO): Promise<IOrderRequestDTO & { id: number }> {
        console.log(
            "[repository]", "Creating new bike order in the DB with id: ",
            bike_order.order_id
        );
        const new_bike_order = await prisma.order.create({
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
        return { ...bike_order, id: new_bike_order.id }
    }

    async updateStatus(bike_order: IOrderRequestDTO & { id: number }, status: string): Promise<IOrderRequestDTO & { id: number }> {
        console.log("[repository]", "Updating order STATUS to", status);
        let updated_bike_order = await prisma.order.update({
            where: {
                id: bike_order.id,
            },
            data: {
                renting_status: status,
            },
        });
        return { ...bike_order, id: updated_bike_order.id }
    }

    // UNUSED
    // async updateOrder(bike_order: IOrderRequestDTO & { id: number }): Promise<IOrderRequestDTO & { id: number }> {
    //     console.log("[repository]", "Updating bike ORDER with id: ", bike_order.order_id);
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
    //     console.log("[repository]", "Deleting bike order with id: ", bike_order.order_id);
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