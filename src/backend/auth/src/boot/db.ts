import {db} from '../db/db';

export async function bootstrapDBconfig() {
    console.log("[AUTH SERVICE] Trying to connect on db on port : ", process.env.POSTGRES_PORT)
    try {
        await db.connect();
        console.log('[AUTH SERVICE] Postgres connected on port', process.env.POSTGRES_PORT);
    } catch (error) {
        console.log('[AUTH SERVICE][ERROR] Error connecting to Postgres', error);
        throw error;
    }
}
