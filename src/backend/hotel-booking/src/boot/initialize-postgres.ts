import { Messages as lmsg } from '../config/Messages';
import postgresClient from '../models/postgresClient';
import { exit } from 'process'; 

async function initializePostgresConnection() {
    console.log(lmsg.BOOT.DEBUG.CONNECTION_ATTEMPT(`Postgres on port ${process.env.POSTGRES_PORT}`, '', { port: process.env.POSTGRES_PORT }).message);
    try {
        await postgresClient.connect();
        console.log(lmsg.BOOT.INFO.CONNECTION_SUCCESS(`Postgres on port ${process.env.POSTGRES_PORT}`, '', { port: process.env.POSTGRES_PORT }).message);
    } catch (error) {
        console.log(lmsg.BOOT.ERROR.CONNECTION_ERROR(`Postgres on port ${process.env.POSTGRES_PORT}`, '', { port: process.env.POSTGRES_PORT }).message);
        exit(1);
    }
}

export default initializePostgresConnection;
