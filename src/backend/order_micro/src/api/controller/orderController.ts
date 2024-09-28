import { Request, Response } from 'express';
import { logger } from "../../../../logger/logger"
import { OrderContext } from './stateLogic/orderStateLogic';


let order = {
    "order": {
        "UUID" : "abc-213-sadsa-4df-ad3-sda",
        "card": "1234-4321-5678-8765",
        "bikes": {
            "road": "2",
                "dirt": "3"
        },
        "hotel": {
            "from": "12/12/12",
                "to": "01/2/16",
                "room": "104"
        }
    }
}


export const handler_book_vacation = async (req: Request, res: Response): Promise<void> => {
    console.log("Order received")
    try {
        /* TODO RICEVO UNA RICHIESTA DA PARTE DI UI/SECURITY */
        /*FACCIO IL PARSING DELLA RICHIESTA
        genero i 3 oggetti che rappresentano i 3 diversi ordini*/
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

