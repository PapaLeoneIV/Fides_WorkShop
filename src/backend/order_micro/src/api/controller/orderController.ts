import { Request, Response } from 'express';
import { logger } from "../../../../logger/logger"
import { OrderContext } from './stateLogic/orderStateLogic';


let order = {
    "order": {
        "card": "1234-4321-5678-8765",
        "bikes": {
            "road": "2",
                "dirt": "3"
        },
        "hotel": {
            "from": "12/12/12",
                "to": "01/2/16"
        }
    }
}


export const handler_book_vacation = async (req: Request, res: Response): Promise<void> => {
    try {
        /**TODO implemt the logic to handle the different state of the booking*/
        /*RICEVO UNA RICHIESTA DA PARTE DI UI/SECURITY */
        /*FACCIO IL PARSING DELLA RICHIESTA
        
        genero i 3 oggetti che rappresentano i 3 diversi ordini*/
        const bikes = req.body.order.bikes;

        /** INIZIO A CONTATTARE I VARI SERVIZI PER CONFERME*/
        const order = new OrderContext(bikes);
        order.processOrder();
    } catch (error) {
        logger.error('Error sending data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


export const handler_payment_update = async (req: Request, res: Response): Promise<void> => {
    try {
        /**TODO implemt the logic to handle the different state of the booking*/
        const data = { message: "Data received successfully!" };
        res.status(200).json(data);
    } catch (error) {
        logger.error('Error sending data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


export const handler_hotel_update = async (req: Request, res: Response): Promise<void> => {
    try {
        /**TODO implemt the logic to handle the different state of the booking*/
        const data = { message: "Data received successfully!" };
        res.status(200).json(data);
    } catch (error) {
        logger.error('Error sending data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


export const handler_bike_update = async (req: Request, res: Response): Promise<void> => {
    try {

    } catch (error) {
        logger.error('Error sending data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

