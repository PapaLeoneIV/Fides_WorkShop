import pkg from 'pg';
import dotenv from 'dotenv';
import { exit } from 'process';

const { Pool } = pkg;

dotenv.config();

export const db = new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5436', 10),
    database: process.env.POSTGRES_DB,
});

export async function connectToDatabase() {
    console.log("Trying to connect on db on port : ", process.env.POSTGRES_PORT)
    try {
        await db.connect();
        console.log('Postgres connected on port', process.env.POSTGRES_PORT);
    } catch (error) {
        console.error('Error connecting to Postgres', error);
        exit(1);
    }
}

