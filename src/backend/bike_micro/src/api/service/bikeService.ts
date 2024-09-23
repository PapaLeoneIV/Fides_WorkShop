import { Request, Response } from 'express';
import { z } from "zod"
/**EXAMPLE OF REQUEST JSON *       
 *      {UUID: 122,
            bike {
                road: 0
                dirt: 2
            }
        }    
*/
/*Queata sara la funzione che il nostro Bike microservice usera per ricevere dati dall esterno 
Verra fatto il parsing, e iniziera la logica interna di questo microservizio per validare la richiesta*/
export const receive_order = async (req: Request, res: Response): Promise<void> => {
    try {
        /**TODO implemt the logic to receive data*/

        /*PARSING DELLA RICHIESTA */
        /**RISPOSTA DI PRESA IN CONSIDERAZIONE VERSO ORDER SERVICE */
        /**CONTROLLO NEL DB SE CI SONO BICICLETTE DISPONIBILI */
            /**SI --> Rispondo con APPROVED */
            /**NO --> Rispondo con DENIED */

        console.log(req.body);
        const data = { message: "Data received successfully!" };
        res.status(200).json(data);
    } catch (error) {
        console.error('Error sending data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**Questa sara la funzione che il nostro bike microservice usera quando OOM(order management service) fara delle richieste
 * per sapere in che stato si trova la sua richiesta(PENDING, APPROVED, DENIED)
 */
export const handler_confirm_request = async (req: Request, res: Response): Promise<void> => {
    try {
        /**TODO implemt the response back to OOM(order management service) to update it about the state of the request */
        const data = { message: "Request taken in consideration, will answear back shortly!" };
        res.status(200).json(data);
    } catch (error) {
        console.error('Error sending data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
/**Questa sara la funzione che il nostro bike microservice usera quando lo shop delle bici dovra
 * contattarci per aggiungere/togliere delle bici dal DB
 */
export const handler_bike_shop_update = async (req: Request, res: Response): Promise<void> => {
    try {
        /**TODO implemt the response back to OOM(order management service) to update it about the state of the request */
        const data = { message: "Request taken in consideration, will answear back shortly!" };
        res.status(200).json(data);
    } catch (error) {
        console.error('Error sending data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}