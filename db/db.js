import pkg from 'pg';
import dotenv from 'dotenv';
import { ExitStatus } from 'typescript';
const { Pool } = pkg;

dotenv.config();

const db = new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: 'localhost', // Docker exposes PostgreSQL on localhost
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
});

try {
    db.connect();
    console.log('Postgres connected on port', process.env.POSTGRES_PORT);
} catch (error) {
    console.error('Error connecting to Postgres', error);
    process.exit(ExitStatus)
}


export { db };

