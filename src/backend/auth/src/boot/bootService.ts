import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import logger from './config/logger';
import log  from "../config/logs";
import initializePostgresConnection from "./initialize-postgres";
import initializeRabbitmqConnection from "./initialize-rabbitmq";

async function bootService() {
  try {
    await initializePostgresConnection();
    await initializeRabbitmqConnection();
    console.log(log.BOOT.INFO.BOOTING("Authorization Service"));
  } catch (error) {
    console.error(log.BOOT.ERROR.BOOTING("Authorization Rental Service", error));
  }
}

export default bootService;
