//variables to connect to the server
const rmqUser = process.env.RABBITMQ_USER || "rileone"
const rmqPass = process.env.RABBITMQ_PASSWORD || "password"
const rmqhost = process.env.RABBITMQ_HOST || "rabbitmq"
//queue names
const HOTEL_SERVICE_ORDER_REQ_QUEUE = "hotel_service_hotel_request"
const HOTEL_SERVICE_SAGA_REQ_QUEUE = "hotel_service_saga_hotel_request"

export {
    rmqUser,
    rmqPass,
    rmqhost,
    HOTEL_SERVICE_ORDER_REQ_QUEUE,
    HOTEL_SERVICE_SAGA_REQ_QUEUE
}