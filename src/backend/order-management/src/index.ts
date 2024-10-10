import { connectToDatabase } from './db/db';
import { rabbitmqClient } from "./messageBroker/connection";

const port = 3003;

async function main() {

   connectToDatabase();
   await rabbitmqClient.connect();

   rabbitmqClient.consumeBookingOrder();
   rabbitmqClient.consumeBikeResponse();
    /*consumeHotelResponse();
    consumePaymentResponse();
 */

    /*     
        app.use("/order/", OrderRouter);
    
        app.listen(port, () => {
           console.log("[INFO] Server running on http://localhost:3003");
        }); */
}

main();


