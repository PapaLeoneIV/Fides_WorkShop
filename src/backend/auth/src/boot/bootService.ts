import { HTTPErrors as HTTPerror } from "../config/HTTPErrors";
import { Messages as log } from "../config/Messages";
import initializePostgresConnection from "./initialize-postgres";
import initializeRabbitmqConnection from "./initialize-rabbitmq";

async function bootService() {
  try {
    await initializePostgresConnection();
    await initializeRabbitmqConnection();
    console.log(log.BOOT.INFO.BOOTING("Authorization Service"));
  } catch (error) {
    console.error(log.BOOT.ERROR.BOOTING("Authorization Rental Service", error));
    throw new Error(HTTPerror.INTERNAL_SERVER_ERROR.message);
  }
}

export default bootService;
