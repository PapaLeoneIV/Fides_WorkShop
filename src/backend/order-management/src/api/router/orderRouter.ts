import express, { Router } from "express";
import { handler_book_vacation } from "../controller/orderController";

export const app = express();

app.use(express.json())

const OrderRouter = Router();

/*TODO these function can be implemented using RABBITMQ and not GET and POST */
OrderRouter.post("/book_vacation", handler_book_vacation);
console.log("[INFO] Set up handler_book_vacation...")


/*qui dovrei usare il client di RABBIT per mettermi in ascolto di messaggi provenienti dal frontend */







export { OrderRouter };
