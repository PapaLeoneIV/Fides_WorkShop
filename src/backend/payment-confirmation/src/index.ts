
import { connectToDatabase } from './db/db';
import { rabbitmqClient } from "./router/rabbitMQClient";


const port = 3002;

async function main() {
    connectToDatabase();
    await rabbitmqClient.connect();
    rabbitmqClient.consumePaymentgOrder();
    //app.use("/payment/", MoneyRouter);
//
    //app.listen(port, () => {
    //   console.log("[INFO] Server running on http://localhost:3002");
    //});
}

main();

