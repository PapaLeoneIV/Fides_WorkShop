import pkg from 'pg';
import dotenv from 'dotenv';


const { Pool } = pkg;

dotenv.config();

const db = new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: 'db_order_management',
    port: parseInt(process.env.POSTGRES_PORT || '5436', 10),
    database: process.env.POSTGRES_DB,
});



export {
    db
}