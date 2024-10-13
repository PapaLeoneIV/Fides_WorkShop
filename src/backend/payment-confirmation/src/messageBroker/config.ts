import dotenv from "dotenv"

dotenv.config()

console.log("RabbitMQ Configurations: ", process.env.RABBITMQ_USER, process.env.RABBITMQ_PASSWORD, process.env.RABBITMQ_HOST)

const rmqUser = process.env.RABBITMQ_USER || "rileone"
const rmqPass = process.env.RABBITMQ_PASSWORD || "password"
const rmqhost = process.env.RABBITMQ_HOST || "rabbitMQ"

const REQ_BIKE_QUEUE = "bike_request"
const REQ_HOTEL_QUEUE = "hotel_request"
const REQ_PAYMENT_QUEUE = "payment_request"
const REQ_BOOKING_QUEUE = "booking_request"

const RESP_BIKE_QUEUE = "bike_response"
const RESP_HOTEL_QUEUE = "hotel_response"
const RESP_PAYMENT_QUEUE = "payment_response"
const RESP_BOOKING_QUEUE = "booking_response"

const SAGA_RESP_BIKE_QUEUE = "saga_bike_response"
const SAGA_RESP_HOTEL_QUEUE = "saga_hotel_response"


export {
    rmqUser, rmqPass, rmqhost,
    REQ_BIKE_QUEUE, REQ_HOTEL_QUEUE, REQ_PAYMENT_QUEUE, REQ_BOOKING_QUEUE,
    RESP_BIKE_QUEUE, RESP_HOTEL_QUEUE, RESP_PAYMENT_QUEUE, RESP_BOOKING_QUEUE,
    SAGA_RESP_BIKE_QUEUE, SAGA_RESP_HOTEL_QUEUE
} 