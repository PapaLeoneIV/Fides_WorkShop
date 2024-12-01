import logger from './config/logger';
import log  from "../config/logs";
import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import postgresClient from "../models/postgresClient";

async function initializePostgresConnection() {
  try {
    await postgresClient.connect();
    console.log(log.BOOT.INFO.CONNECTING(`Postgres on port ${process.env.POSTGRES_PORT}`));
  } catch (error) {
    console.log(log.BOOT.ERROR.CONNECTING("Postgres", { error }));
    throw new Error(HTTPerror.INTERNAL_SERVER_ERROR.message);
  }
}

export default initializePostgresConnection;
