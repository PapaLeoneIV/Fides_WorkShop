//rabbit variables for connection to the server
const rmqUser = process.env.RABBITMQ_USER || "rileone"
const rmqPass = process.env.RABBITMQ_PASSWORD || "password"
const rmqhost = process.env.RABBITMQ_HOST || "rabbitmq"


//queues names
const BIKE_SERVICE_ORDER_REQ_QUEUE = "bike_service_bike_request"
const BIKE_SERVICE_SAGA_REQ_QUEUE = "bike_service_saga_bike_request"

export {
    rmqUser,
    rmqPass,
    rmqhost,
    BIKE_SERVICE_ORDER_REQ_QUEUE,
    BIKE_SERVICE_SAGA_REQ_QUEUE
}