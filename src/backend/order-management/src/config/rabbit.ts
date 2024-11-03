//variables to connect to the server
export const rmqUser = process.env.RABBITMQ_USER || "rileone"
export const rmqPass = process.env.RABBITMQ_PASSWORD || "password"
export const rmqhost = process.env.RABBITMQ_HOST || "rabbitmq"


//queues names
export const ORDER_SERVICE_BIKE_RESP = "order_service_bike_response"
export const ORDER_SERVICE_HOTEL_RESP = "order_service_hotel_response"
export const ORDER_SERVICE_SAGA_BIKE_RESP = "order_service_SAGA_hotel_request"
export const ORDER_SERVICE_SAGA_HOTEL_RESP = "order_service_SAGA_bike_request"
export const ORDER_SERVICE_RESP_PAYMENT = "order_service_payment_request"
export const ORDER_SERVICE_REQ_BOOKING = "order_service_booking_request"
export const ORDER_SERVICE_USER_INFO_RESP = "order_service_user_info_response"
export const Exchange = "OrderEventExchange"