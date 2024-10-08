import dotenv from "dotenv"

dotenv.config()

console.log("RabbitMQ Configurations: ", process.env.RABBITMQ_USER, process.env.RABBITMQ_PASSWORD, process.env.RABBITMQ_HOST)

const rmqUser = process.env.RABBITMQ_USER || "rileone"
const rmqPass = process.env.RABBITMQ_PASSWORD || "password"
const rmqhost = process.env.RABBITMQ_HOST || "rabbitMQ"
const BIKE_QUEUE = "bike_order"
const HOTEL_QUEUE = "hotel_order"
const PAYMENT_QUEUE = "payment_order"
const BOOKING_QUEUE = "booking_order"



export { rmqUser, rmqPass, rmqhost, BIKE_QUEUE, HOTEL_QUEUE, PAYMENT_QUEUE, BOOKING_QUEUE}