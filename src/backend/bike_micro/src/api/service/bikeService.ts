import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface bike_order{
    id : string;
    road_bike_requested: string;
    dirt_bike_requested: string;
    renting_status: string;
    created_at: Date;
    updated_at: Date;
}

export class BikeOrder {

    public info: bike_order;

    constructor(info: bike_order) {
        this.info = info;
    }

    public get id(): string {
        return this.info.id;
    }

    public get road_bike_requested(): number {
        return parseInt(this.info.road_bike_requested, 10);
    }

    public get dirt_bike_requested(): number {
        return parseInt(this.info.dirt_bike_requested, 10);
    }

    public get renting_status(): string {
        return this.info.renting_status;
    }

    public get created_at(): Date {
        return this.info.created_at;
    }

    public get updated_at(): Date {
        return this.info.updated_at;
    }

}


export class BikeOrdersManager {
    async getBikeOrderById(id: string): Promise<BikeOrder> {
        const bike_order  = await prisma.order.findUnique({
            where: {
                id: id,
            },
        }) || null;

        if (!bike_order) {
            throw new Error(`Bike order with id ${id} not found`);
        }
        return new BikeOrder(bike_order);
    }

    async createBikeOrder(bike_order: BikeOrder): Promise<BikeOrder> {
        const new_bike_order = await prisma.order.create({
            data: {
                road_bike_requested: bike_order.info.road_bike_requested,
                dirt_bike_requested: bike_order.info.dirt_bike_requested,
                renting_status: bike_order.info.renting_status,
                created_at: bike_order.info.created_at,
                updated_at: bike_order.info.updated_at,
            },
        });
        return new BikeOrder(new_bike_order);
    }

    async updateBikeOrder(bike_order: BikeOrder): Promise<BikeOrder> {
        const updated_bike_order = await prisma.order.update({
            where: {
                id: bike_order.info.id,
            },
            data: {
                road_bike_requested: bike_order.info.road_bike_requested,
                dirt_bike_requested: bike_order.info.dirt_bike_requested,
                renting_status: bike_order.info.renting_status,
                created_at: bike_order.info.created_at,
                updated_at: bike_order.info.updated_at,
            },
        });
        return new BikeOrder(updated_bike_order);
    }

    async updateBikeOrderStatus(id: string, status: string): Promise<BikeOrder> {
        const updated_bike_order = await prisma.order.update({
            where: {
                id: id,
            },
            data: {
                renting_status: status,
            },
        });
        return new BikeOrder(updated_bike_order);
    }

    async deleteBikeOrder(id: string): Promise<void> {
        await prisma.order.delete({
            where: {
                id: id,
            },
        });
    }
}


export class BikeDBManager {
    async getNumberOfRoadBikes(): Promise<number> {
        const road_bikes_count = await prisma.bikes.aggregate({
            _sum: {
                road: true,
            },
        });
        return road_bikes_count._sum.road ?? 0;
    }

    async getNumberOfDirtBikes(): Promise<number> {
        const dirt_bikes_count = await prisma.bikes.aggregate({
            _sum: {
                dirt: true,
            },
        });
        return dirt_bikes_count._sum.dirt ?? 0;
    }

    async incrementBikeCount(road_bikes: number, dirt_bikes: number): Promise<void> {
        await prisma.bikes.updateMany({
            data: {
                road: {
                    increment: road_bikes,
                },
                dirt: {
                    increment: dirt_bikes,
                },
            },
        });
    }

    async decrementBikeCount(road_bikes: number, dirt_bikes: number): Promise<void> {
        await prisma.bikes.updateMany({
            data: {
                road: {
                    decrement: road_bikes,
                },
                dirt: {
                    decrement: dirt_bikes,
                },
            },
        });
    }

}
