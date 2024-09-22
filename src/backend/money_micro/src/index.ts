import express from 'express';
import { db, connectToDatabase } from './db/db';
import { app, MoneyRouter } from "./api/router/moneyRouter"
import { logger } from "../../logger/logger";


const port = 3002;

function main() {
    connectToDatabase();
    app.use("/money_confirmation/", MoneyRouter);

    app.listen(port, () => {
       logger.info("[INFO] Server running on http://localhost:3002");
    });
}

main();

