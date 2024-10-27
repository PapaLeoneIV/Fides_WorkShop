import pkg from 'pg';
import dotenv from 'dotenv';


const { Pool } = pkg;

dotenv.config();

const db = new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: 'db_hotel_booking',
    port: parseInt(process.env.POSTGRES_PORT || '5434'),
    database: process.env.POSTGRES_DB,
});

export default db;

