import express from 'express';
import { db, connectToDatabase } from './db/db';
import { app, OrderRouter } from "./api/router/orderRouter"
import { logger } from "../../logger/logger";

const port = 3003;

function main() {
    connectToDatabase();
    app.use("/order/", OrderRouter);

    app.listen(port, () => {
       logger.info("[INFO] Server running on http://localhost:3003");
    });
}

main();


