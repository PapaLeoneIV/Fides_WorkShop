import dotenv from "dotenv"

dotenv.config()

console.log("RabbitMQ Configurations: ", process.env.RABBITMQ_USER, process.env.RABBITMQ_PASSWORD, process.env.RABBITMQ_HOST)

const rmqUser = process.env.RABBITMQ_USER || "rileone"
const rmqPass = process.env.RABBITMQ_PASSWORD || "password"
const rmqhost = process.env.RABBITMQ_HOST || "rabbitMQ"

const REQ_HOTEL_QUEUE = "hotel_request"

const RESP_HOTEL_QUEUE = "hotel_response"

const SAGA_RESP_HOTEL_QUEUE = "saga_hotel_response"


export {
    rmqUser, rmqPass, rmqhost,
    REQ_HOTEL_QUEUE,
    RESP_HOTEL_QUEUE,
    SAGA_RESP_HOTEL_QUEUE
} 