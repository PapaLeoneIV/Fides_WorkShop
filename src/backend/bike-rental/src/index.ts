import { connectToDatabase } from './db/db';
import { rabbitmqClient } from "./messageBroker/connection";
import { app, BikeRouter } from "./api/router/bikeRouter"
const port = 3000;


async function main() {
    connectToDatabase();
    await rabbitmqClient.connect();
    rabbitmqClient.consumeBikeOrder();
    //app.use("/bike_renting/", BikeRouter);
    //
    //app.listen(port, () => {
    //    console.log("[INFO] Server running on http://localhost:3000");
    //});
}

main();


