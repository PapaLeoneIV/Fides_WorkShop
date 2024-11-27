const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";

const QueueNames = {
  LOGIN_QUEUE_REQUEST: "login_request",
  REGISTRATION_QUEUE_REQUEST: "registration_request",
};

const EXCHANGE = "OrderEventExchange";

export { RABBITMQ_URL, QueueNames, EXCHANGE };
