import express from 'express';
import { db, connectToDatabase } from './db/db';
import { app, OrderRouter } from "./api/router/orderRouter"

const port = 3000;

function main() {
    connectToDatabase();
    app.use("/order/", OrderRouter);

    app.listen(3000, () => {
        console.log("Server running on http://localhost:3000");
    });
}

main();


