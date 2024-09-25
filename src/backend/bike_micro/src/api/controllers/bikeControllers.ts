import { Request, Response } from "express";
import { logger } from "../../../../logger/logger";
import { z } from "zod";
import axios from "axios";
import { check_bikes_availability } from "../service/bikeService";

const URL_order_management = "http://localhost:3003/order/bike_update";

const order_schema = z.object({
  road: z.string(),
  dirt: z.string(),
});

interface BikeRequested {
  road: number;
  dirt: number;
}
let bike_requested: BikeRequested;

export const receive_order = async ( req: Request, res: Response ): Promise<void> => {
  try {
    const parsedBody = order_schema.parse(req.body);
    logger.info("Data received:", parsedBody);
    bike_requested = {
      road: parseInt(parsedBody.road, 10),
      dirt: parseInt(parsedBody.dirt, 10),
    };
  } catch (error) {
    logger.error("Error parsing data: request body not valid!", error);
    res.status(400).json({ error: "Bad Request" });
  }
  //TMP RESPONSE
  const response = await axios.post(URL_order_management, {status: "PENDING",});
  //CHECK DB
  const db_response = await check_bikes_availability(bike_requested);
  //RESPOND TO OOM
  if (db_response) {
    const management_resp = await axios.post(URL_order_management, {order_status: "BIKE_APPROVED",});
    logger.info("management_resp:", management_resp.data);
    res.send( {status : "BIKE_APPROVED"} );
  } else {
    const management_resp = await axios.post(URL_order_management, {order_status: "DENIED",});
    logger.info("management_resp:", management_resp.data);
    res.send( {status : "BIKE_DENIED"} );
  }
};

/**Questa sara la funzione che il nostro bike microservice usera quando OOM(order management service) fara delle richieste
 * per sapere in che stato si trova la sua richiesta(PENDING, APPROVED, DENIED)
 */
export const handler_confirm_request = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    /**TODO implemt the response back to OOM(order management service) to update it about the state of the request */
    const data = {
      message: "Request taken in consideration, will answear back shortly!",
    };
    res.status(200).json(data);
  } catch (error) {
    logger.error("Error sending data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
/**Questa sara la funzione che il nostro bike microservice usera quando lo shop delle bici dovra
 * contattarci per aggiungere/togliere delle bici dal DB
 */
export const handler_bike_shop_update = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    /**TODO implemt the response back to OOM(order management service) to update it about the state of the request */
    const data = {
      message: "Request taken in consideration, will answear back shortly!",
    };
    res.status(200).json(data);
  } catch (error) {
    logger.error("Error sending data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
