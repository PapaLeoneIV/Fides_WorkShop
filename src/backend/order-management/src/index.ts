import express from 'express';
import { db, connectToDatabase } from './db/db';
import { app, OrderRouter } from "./api/router/orderRouter"
import { consumeBookingOrder, consumeBikeResponse, consumeHotelResponse, consumePaymentResponse } from './messageBroker';

const port = 3003;

function main() {

    connectToDatabase();
    consumeBookingOrder();
    /*consumeBikeResponse();
    consumeHotelResponse();
    consumePaymentResponse();
 */

    /*     
        app.use("/order/", OrderRouter);
    
        app.listen(port, () => {
           console.log("[INFO] Server running on http://localhost:3003");
        }); */
}

main();


