import express from 'express';
import { db, connectToDatabase } from './db/db';
import { app, MoneyRouter } from "./api/router/moneyRouter"

const port = 3000;

function main() {
    connectToDatabase();
    app.use("/money_confirmation/", MoneyRouter);

    app.listen(3000, () => {
        console.log("Server running on http://localhost:3000");
    });
}

main();

