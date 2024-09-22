import express from 'express';
import { logger } from "../../logger/logger";
import { db, connectToDatabase } from './db/db';
import { app, BikeRouter } from "./api/router/bikeRouter"
const port = 3000;

function main() {
    connectToDatabase();
    app.use("/bike_renting/", BikeRouter);

    app.listen(port, () => {
        logger.info("[INFO] Server running on http://localhost:3000");
    });
}

main();


