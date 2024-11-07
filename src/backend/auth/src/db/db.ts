import pkg from 'pg';
import dotenv from 'dotenv';


const { Pool } = pkg;

dotenv.config();

export const db = new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: 'db_auth',
    port: parseInt(process.env.POSTGRES_PORT || '5431'),
    database: process.env.POSTGRES_DB,
});


