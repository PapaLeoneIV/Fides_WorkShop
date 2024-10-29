//variables to connect to the server
const rmqUser = process.env.RABBITMQ_USER || "rileone"
const rmqPass = process.env.RABBITMQ_PASSWORD || "password"
const rmqhost = process.env.RABBITMQ_HOST || "rabbitmq"


//queues names
const PAYMENT_SERVICE_RESP_PAYMENT_QUEUE = "payment_service_payment_request"

export {
    rmqUser,
    rmqPass,
    rmqhost,
    PAYMENT_SERVICE_RESP_PAYMENT_QUEUE
}