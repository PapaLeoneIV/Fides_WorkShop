const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq"

const enum QueueNames {
    // export const ORDER_SERVICE_BIKE_RESP = "order_service_bike_response"
    BIKE_RESP = "order_service_bike_response",
    // export const ORDER_SERVICE_HOTEL_RESP = "order_service_hotel_response"
    HOTEL_RESP = "order_service_hotel_response",
    // export const ORDER_SERVICE_RESP_PAYMENT = "order_service_payment_request"
    PAYMENT_RESP = "order_service_payment_request",
    // export const ORDER_SERVICE_SAGA_BIKE_RESP = "order_service_SAGA_hotel_request"
    SAGA_HOTEL_RESP = "order_service_SAGA_hotel_request",
    // export const ORDER_SERVICE_SAGA_HOTEL_RESP = "order_service_SAGA_bike_request"
    SAGA_BIKE_RESP = "order_service_SAGA_bike_request",
    // export const ORDER_SERVICE_REQ_BOOKING = "order_service_booking_request"
    FRONTEND_REQ = "order_service_booking_request",
}

const EXCHANGE = "OrderEventExchange"

export { RABBITMQ_URL, QueueNames, EXCHANGE }

// export const Exchange = "OrderEventExchange"