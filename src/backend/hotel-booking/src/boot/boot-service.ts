import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import logger from '../config/logger';
import log  from "../config/logs";
import initializePostgresConnection from "./initialize-postgres";
import initializeRabbitmqConnection from "./initialize-rabbitmq";

async function bootService() {
  try {
    await initializePostgresConnection();
    await initializeRabbitmqConnection();
    logger.info(log.BOOT.BOOTING("Hotel Booking Service Started"));
  } catch (error) {
    logger.error(log.BOOT.BOOTING(`Error starting Hotel Booking Service: ${error}`));
  }
}

export default bootService;
