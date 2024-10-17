import dotenv from "dotenv"

dotenv.config()

console.log("RabbitMQ Configurations: ", process.env.RABBITMQ_USER, process.env.RABBITMQ_PASSWORD, process.env.RABBITMQ_HOST)

const rmqUser = process.env.RABBITMQ_USER || "rileone"
const rmqPass = process.env.RABBITMQ_PASSWORD || "password"
const rmqhost = process.env.RABBITMQ_HOST || "rabbitMQ"

const LOGIN_QUEUE_REQUEST = "login_request"
const LOGIN_QUEUE_RESPONSE = "login_response"

const REGISTRATION_QUEUE_REQUEST = "registration_request"
const REGISTRATION_QUEUE_RESPONSE = "registration_response"


export {
    rmqUser, rmqPass, rmqhost,
    LOGIN_QUEUE_REQUEST, LOGIN_QUEUE_RESPONSE,
    REGISTRATION_QUEUE_REQUEST, REGISTRATION_QUEUE_RESPONSE
} 