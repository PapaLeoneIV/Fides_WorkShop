import pkg from "pg";
import dotenv from "dotenv";
import logger from '../config/logger';

const { Pool } = pkg;

dotenv.config();

logger.info(`Connecting to Postgres on port ${process.env.POSTGRES_PORT}`);
logger.info(`Post user: ${process.env.POSTGRES_USER}`);
logger.info(`Post password: ${process.env.POSTGRES_PASSWORD}`);
logger.info(`Post host: ${process.env.POSTGRES_HOST}`);
logger.info(`Post database: ${process.env.POSTGRES_DB}`);

const postgresClient = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  database: process.env.POSTGRES_DB,
});

export default postgresClient;
