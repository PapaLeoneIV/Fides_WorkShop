import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import logger from '../config/logger';
import log  from "../config/logs";
import initializePostgresConnection from "./initialize-postgres";
import initializeRabbitmqConnection from "./initialize-rabbitmq";

async function bootService() {
  try {
    await initializePostgresConnection();
    await initializeRabbitmqConnection();
    logger.info(log.BOOT.BOOTING("Bike Rental Service"));
  } catch (error) {
    logger.error(log.BOOT.BOOTING("Bike Rental Service", error));
    throw new Error(HTTPerror.INTERNAL_SERVER_ERROR.message);
  }
}

export default bootService;
