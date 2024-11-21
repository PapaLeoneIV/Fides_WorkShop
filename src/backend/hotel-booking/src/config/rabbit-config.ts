const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";

const QueueNames = {
    ORDER_REQ: "hotel_service_hotel_request",
    SAGA_REQ: "hotel_service_saga_hotel_request",
}

const EXCHANGE = "OrderEventExchange";

export { RABBITMQ_URL, QueueNames, EXCHANGE };
