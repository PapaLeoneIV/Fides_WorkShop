import pkg from 'pg';
import dotenv from 'dotenv';
import { exit } from 'process';
import { logger } from "../../../logger/logger";


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
    logger.info("[INFO] Trying to connect on db on port : ", process.env.POSTGRES_PORT)
    try {
        await db.connect();
        logger.info('[INFO] Postgres connected on port', process.env.POSTGRES_PORT);
    } catch (error) {
        logger.error('[ERROR] Error connecting to Postgres', error);
        exit(1);
    }
}

