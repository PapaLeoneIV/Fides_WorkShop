import db from '../db/db';

async function bootstrapDBconfig() {
    console.log("[BIKE SERVICE] Trying to connect on db on port : ", process.env.POSTGRES_PORT)
    try {
        await db.connect();
        console.log('[BIKE SERVICE] Postgres connected on port', process.env.POSTGRES_PORT);
    } catch (error) {
        console.log('[BIKE SERVICE][ERROR] Error connecting to Postgres', error);
        throw error;
    }
}

export {
    bootstrapDBconfig,
}