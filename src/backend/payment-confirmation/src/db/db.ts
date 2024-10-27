import pkg from 'pg';
import dotenv from 'dotenv';
import { exit } from 'process';


const { Pool } = pkg;

dotenv.config();

const db = new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: 'db_payment_confirmation',
    port: parseInt(process.env.POSTGRES_PORT || '5435', 10),
    database: process.env.POSTGRES_DB,
});


export default db;

