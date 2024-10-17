import dotenv from "dotenv"

dotenv.config()

console.log("RabbitMQ Configurations: ", process.env.RABBITMQ_USER, process.env.RABBITMQ_PASSWORD, process.env.RABBITMQ_HOST)

const rmqUser = process.env.RABBITMQ_USER || "rileone"
const rmqPass = process.env.RABBITMQ_PASSWORD || "password"
const rmqhost = process.env.RABBITMQ_HOST || "rabbitMQ"

const REQ_PAYMENT_QUEUE = "payment_request"

const RESP_PAYMENT_QUEUE = "payment_response"



export {
    rmqUser, rmqPass, rmqhost,
    REQ_PAYMENT_QUEUE,
    RESP_PAYMENT_QUEUE,

} 