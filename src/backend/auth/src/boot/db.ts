import {db} from '../db/db';

export async function bootstrapDBconfig() {
    console.log("[INFO] Trying to connect on db on port : ", process.env.POSTGRES_PORT)
    try {
        await db.connect();
        console.log('[INFO] Postgres connected on port', process.env.POSTGRES_PORT);
    } catch (error) {
        console.log('[ERROR] Error connecting to Postgres', error);
        throw error;
    }
}
