import db from '../db/db';
import { exit } from 'process'; 

async function connectToDatabase() {
    console.log("[INFO] Trying to connect on db on port : ", process.env.POSTGRES_PORT)
    try {
        await db.connect();
        console.log('[INFO] Postgres connected on port', process.env.POSTGRES_PORT);
    } catch (error) {
        console.log('[ERROR] Error connecting to Postgres', error);
        exit(1);
    }
}

export default connectToDatabase;
