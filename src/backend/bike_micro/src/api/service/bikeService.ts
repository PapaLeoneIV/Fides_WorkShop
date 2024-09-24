import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()

interface BikeRequested {
    road: number;
    dirt: number;
}

export const check_bikes_availability = async (req : BikeRequested) => {
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

    if(req.road < (road_bikes_count._sum.road ?? 0)
            && req.dirt < (dirt_bikes_count._sum.dirt ?? 0)){
        /*TODO bisogna aggiornare il database */
        return true;
    }
   return false;
}
