import postgresClient from '../models/postgresClient';
import { exit } from 'process';

async function initializePostgresConnection() {
    console.log("[boot] Trying to connect on db on port : ", process.env.POSTGRES_PORT)
    try {
        await postgresClient.connect();
        console.log('[boot] Postgres connected on port', process.env.POSTGRES_PORT);
    } catch (error) {
        console.log('[boot] Error connecting to Postgres', error);
        exit(1);
    }
}

export default initializePostgresConnection;