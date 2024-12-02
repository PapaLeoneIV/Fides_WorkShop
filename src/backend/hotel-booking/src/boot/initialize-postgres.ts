import logger from '../config/logger';
import log  from "../config/logs";
import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import postgresClient from "../models/postgresClient";

async function initializePostgresConnection() {
  try {
    await postgresClient.connect();
    logger.info(log.BOOT.CONNECTING(`Postgres on port ${process.env.POSTGRES_PORT}`));
  } catch (error) {
    logger.error(log.BOOT.CONNECTING(`Error connecting to Postgres: ${error}`));
  }
}

export default initializePostgresConnection;
