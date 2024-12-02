const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq"

const enum QueueNames {
    PAYMENT_RESP = "payment_service_payment_request",
}

const EXCHANGE = "OrderEventExchange"

export { RABBITMQ_URL, QueueNames, EXCHANGE }