import dotenv from "dotenv"

dotenv.config()

console.log("RabbitMQ Configurations: ", process.env.RABBITMQ_USER, process.env.RABBITMQ_PASSWORD, process.env.RABBITMQ_HOST)


//TODO is not getting the env variables from the .env file
const rmqUser = process.env.RABBITMQ_USER || "rileone"
const rmqPass = process.env.RABBITMQ_PASSWORD || "password"
const rmqhost = process.env.RABBITMQ_HOST || "rabbitMQ"

const REQ_BIKE_QUEUE = "bike_request"

const RESP_BIKE_QUEUE = "bike_response"

const SAGA_RESP_BIKE_QUEUE = "saga_bike_response"


export {
    rmqUser, rmqPass, rmqhost,
    REQ_BIKE_QUEUE, 
    RESP_BIKE_QUEUE,
    SAGA_RESP_BIKE_QUEUE
} 