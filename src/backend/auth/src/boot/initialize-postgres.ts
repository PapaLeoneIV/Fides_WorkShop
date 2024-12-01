import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import logger from '../config/logger';
import log  from "../config/logs";
import postgresClient from "../models/postgresClient";

async function initializePostgresConnection() {
  try {
    await postgresClient.connect();
    logger.info(log.BOOT.CONNECTING(`Postgres on port ${process.env.POSTGRES_PORT}`));
  } catch (error) {
    logger.error(log.BOOT.CONNECTING("Postgres", { error }));
  }
}

export default initializePostgresConnection;
