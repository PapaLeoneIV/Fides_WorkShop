import pkg from 'pg';
import dotenv from 'dotenv';
const { Pool } = pkg;

dotenv.config();

const db = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: 'localhost', // Docker exposes PostgreSQL on localhost
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
});

function pingDB(){
    try {
        db.connect();
        console.log('Postgres connected on port', process.env.POSTGRES_PORT);
        return true;
    } catch (error) {
        console.error('Error connecting to Postgres', error);
        return false;
    }
}

export { db, pingDB };

