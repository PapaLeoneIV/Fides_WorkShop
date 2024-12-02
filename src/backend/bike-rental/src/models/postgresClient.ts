import pkg from "pg";
import dotenv from "dotenv";
import logger from '../config/logger';
const { Pool } = pkg;

dotenv.config();

const postgresClient = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  //TODO understand why POSGRES_HOST is undefined DHN
  host: "db_bike_rental",
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  database: process.env.POSTGRES_DB,
});

export default postgresClient;
