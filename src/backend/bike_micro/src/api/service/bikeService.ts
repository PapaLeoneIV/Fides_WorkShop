import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface BikeRequested {
    road: string;
    dirt: string;
}

export const check_bikes_availability = async (req: BikeRequested): Promise<boolean> => {
    try {
        const road_bikes_count = await prisma.bikes.aggregate({
            _sum: {
                road: true,
            },
        });

        const dirt_bikes_count = await prisma.bikes.aggregate({
            _sum: {
                dirt: true,
            },
        });

        const available_road_bikes = road_bikes_count._sum.road ?? 0;
        const available_dirt_bikes = dirt_bikes_count._sum.dirt ?? 0;
        
        const requested_road_bikes = parseInt(req.road, 10);
        const requested_dirt_bikes = parseInt(req.dirt, 10);
        console.log("Requested road bikes:", requested_road_bikes);
        console.log("Requested dirt bikes:", requested_dirt_bikes);

        if (requested_road_bikes <= available_road_bikes 
            && requested_dirt_bikes <= available_dirt_bikes) {
            console.log("Bikes are available, updating database...");
            await prisma.bikes.updateMany({
                data: {
                    road: {
                        decrement: requested_road_bikes,
                    },
                    dirt: {
                        decrement: requested_dirt_bikes,
                    },
                },
            });
            console.log("Database successfully updated.");
            return true;
        }

        console.log("Not enough bikes available.");
        return false; 
    } catch (error) {
        console.log("Error checking bike availability:", error);
        return false; 
    }
};

export const revert_bike_order = async (req: BikeRequested): Promise<boolean> => {
    try {
        await prisma.bikes.updateMany({
            data: {
                road: {
                    increment: parseInt(req.road, 10),
                },
                dirt: {
                    increment: parseInt(req.dirt, 10),
                },
            },
        });
        console.log("Database successfully updated.");
        return true;
    } catch (error) {
        console.log("Error reverting bike order:", error);
        return false;
    }
}