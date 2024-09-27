import { PrismaClient } from '@prisma/client';
import { logger } from "../../../../logger/logger"
import { string } from 'zod';
const prisma = new PrismaClient();

interface hotelRequested {
    to: string;
    from: string;
    room: string;
}


export const check_hotel_availability = async (req: hotelRequested): Promise<boolean> => {
    //TODO: implement the logic to check if the hotel is available through prisma and update it
    const startDate = new Date(req.from); // e.g., '2024-09-27'
    const endDate = new Date(req.to); // e.g., '2024-10-01' 
    console.log(startDate)
    const datesID = await prisma.date.findMany({
        where: {
            booking_date: {
                gte: startDate,
                lte: endDate
            }
        },})
    console.log(datesID)
                    
                    /**DATA TABLE
                     * id | booking_date 
                    ---+--------------
                     1 | 2024-09-27
                     2 | 2024-09-28
                     3 | 2024-09-29
                     4 | 2024-09-30
                     5 | 2024-10-01
                     6 | 2024-10-02
                     7 | 2024-10-03
                     8 | 2024-10-04
                     9 | 2024-10-05
                    10 | 2024-10-06
                    11 | 2024-10-07 */
    //prima prendo l id di ogni data della request
    //avendo l id, posso filtrare attraverso il numero di stanza
    //REQUEST (101, 1giugno, 5giugno)
    // fatto questo, ottengo
    //                          ROOM TABLE
    //-----------------------------------------------------------
    // id  | room_number | is_available    |       date_id      |
    // ---+-------------+--------------+-------------------------
    // 1   | 101         | f               |       1 (1 giugno) |
    // 2   | 101         | t               |       2 (2 giugno) |
    // 3   | 101         | t               |       3 (3 giugno) |
    // 4   | 101         | t               |       4 (4 giugno) |    
    // 5   | 101         | f               |       5 (5 giugno) |
    //-----------------------------------------------------------    
    // da qui posso controllare se tutte righe ottenute sono disponibili
    //se si update il db e rispondo che la richiesta è stata accettata
    //altrimenti rispondo che la richiesta non è stata accettata
    return true;
}
