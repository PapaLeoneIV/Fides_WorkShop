import express from 'express';
import { db, connectToDatabase } from './db/db';
import { app, HotelRouter } from "./api/router/hotelRouter"

const port = 3000;

function main() {
    connectToDatabase();
    app.use("/hotel_booking/", HotelRouter);

    app.listen(3000, () => {
        console.log("Server running on http://localhost:3000");
    });
}

main();

