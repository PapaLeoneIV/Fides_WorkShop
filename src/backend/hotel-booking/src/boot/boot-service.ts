import initializePostgresConnection from "./initialize-postgres";
import initializeRabbitmqConnection from "./initialize-rebbimq";

async function bootService() {
    await initializePostgresConnection();
    await initializeRabbitmqConnection();
}

export default bootService;