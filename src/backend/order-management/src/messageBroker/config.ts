import dotenv from "dotenv"

dotenv.config()


const rmqUser = process.env.RABBITMQ_USER
const rmqPass = process.env.RABBITMQ_PASSWORD
const rmqhost = process.env.RABBITMQ_HOST || "rabbitmq"
const BIKE_QUEUE = "bike_order"
const HOTEL_QUEUE = "hotel_order"
const PAYMENT_QUEUE = "payment_order"



export { rmqUser, rmqPass, rmqhost, BIKE_QUEUE, HOTEL_QUEUE, PAYMENT_QUEUE}