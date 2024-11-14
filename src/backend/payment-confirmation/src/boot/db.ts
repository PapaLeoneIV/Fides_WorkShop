import db from "../db/db";
import { exit } from "process";

async function bootstrapDBconfig() {
    console.log("[PAYMENT SERVICE] Trying to connect on db on port : ", process.env.POSTGRES_PORT)
     try {
         await db.connect();
        console.log('[PAYMENT SERVICE] Postgres connected on port', process.env.POSTGRES_PORT);
     } catch (error) {
         console.log('[PAYMENT SERVICE][ERROR] Error connecting to Postgres', error);
         exit(1);
     }
 }

 export default bootstrapDBconfig;  