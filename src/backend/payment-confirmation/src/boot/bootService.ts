import logger from '../config/logger';
import log  from "../config/logs";
import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import initializePostgresConnection from "./initialize-postgres";
import initializeRabbitmqConnection from "./initialize-rabbitmq";

async function bootService() {
  try {
    await initializePostgresConnection();
    await initializeRabbitmqConnection();
    logger.info(log.BOOT.BOOTING("Payment Confirmation Service Started"));
  } catch (error) {
    logger.error(log.BOOT.BOOTING(`Error starting Payment Confirmation Service: ${error}`));
    // throw new Error(HTTPerror.INTERNAL_SERVER_ERROR.message);
  }
}

export default bootService;
