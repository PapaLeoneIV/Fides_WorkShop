//variables to connect to the server
const rmqUser = process.env.RABBITMQ_USER || "rileone"
const rmqPass = process.env.RABBITMQ_PASSWORD || "password"
const rmqhost = process.env.RABBITMQ_HOST || "rabbitmq"


//queues names
const ORDER_SERVICE_BIKE_RESP_QUEUE = "order_service_bike_response"
const ORDER_SERVICE_HOTEL_RESP_QUEUE = "order_service_hotel_response"
const ORDER_SERVICE_SAGA_BIKE_RESP_QUEUE = "order_service_SAGA_hotel_request"
const ORDER_SERVICE_SAGA_HOTEL_RESP_QUEUE = "order_service_SAGA_bike_request"
const ORDER_SERVICE_RESP_PAYMENT_QUEUE = "order_service_payment_request"
const ORDER_SERVICE_REQ_BOOKING_QUEUE = "order_service_booking_request"

const Exchange = "OrderEventExchange"



export {
    rmqUser,
    rmqPass,
    rmqhost,
    ORDER_SERVICE_BIKE_RESP_QUEUE,
    ORDER_SERVICE_HOTEL_RESP_QUEUE,
    ORDER_SERVICE_SAGA_BIKE_RESP_QUEUE,
    ORDER_SERVICE_SAGA_HOTEL_RESP_QUEUE,
    ORDER_SERVICE_RESP_PAYMENT_QUEUE,
    ORDER_SERVICE_REQ_BOOKING_QUEUE,
    Exchange
}