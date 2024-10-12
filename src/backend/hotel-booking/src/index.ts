import { connectToDatabase } from './db/db';
import { rabbitmqClient } from "./messageBroker/connection";
import { app, HotelRouter } from "./api/router/hotelRouter"

const port = 3001;

async function main() {
    connectToDatabase();
    await rabbitmqClient.connect()
    rabbitmqClient.consumeHotelOrder()
    rabbitmqClient.consumecancelHotelOrder()
   /*  app.use("/hotel_booking/", HotelRouter);

    app.listen(port, () => {
        console.log("[INFO] Server running on http://localhost:3001");
    }); */
}

main();

