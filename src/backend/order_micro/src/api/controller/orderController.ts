import { Request, Response } from 'express';
import { logger } from "../../../../logger/logger"
import { OrderContext } from './stateLogic/orderStateLogic';
import { z } from 'zod';

const order_schema = z.object({
    order: z.object({
        UUID: z.string(),
        card: z.string(),
        bikes: z.object({
            road: z.string(),
            dirt: z.string()
        }),
        hotel: z.object({
            from: z.string(),
            to: z.string(),
            room: z.string()
        })
    })
});


export const handler_book_vacation = async (req: Request, res: Response): Promise<void> => {
    let parsedBody: any;
    try {
        parsedBody = order_schema.parse(req.body);
    } catch (error) {
        logger.error("Error parsing data: request body not valid!", error);
        res.status(400).json({ error: "Bad Request" });
        return;
    }
    try {
        const bikes = req.body.order.bikes
        const hotel = req.body.order.hotel

        const order = new OrderContext(bikes, hotel);
        console.log("Processing the order...")
        order.processOrder(bikes, hotel);
        //FIRST RESPONSE TO CLIENT I SUPPOSE INNIT
        res.send("Order is being processed\n")
    } catch (error) {
        logger.error('Error sending data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
    }
}


export const handler_payment_update = async (req: Request, res: Response): Promise<void> => {
    try {
        /*TODO implemt the logic to handle the different state of the booking*/
        const data = { message: "Data received successfully!" };
        res.status(200).json(data);
    } catch (error) {
        logger.error('Error sending data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


export const handler_hotel_update = async (req: Request, res: Response): Promise<void> => {
    try {
        /*TODO implemt the logic to handle the different state of the booking*/
        const data = { message: "Data received successfully!" };
        res.status(200).json(data);
    } catch (error) {
        logger.error('Error sending data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


export const handler_bike_update = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("received response from bike shop")
    } catch (error) {
        logger.error('Error sending data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

