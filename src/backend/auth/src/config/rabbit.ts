export const LOGIN_QUEUE_REQUEST = "login_request"

export const REGISTRATION_QUEUE_REQUEST = "registration_request"

export const USER_INFO_QUEUE = "user_info_request"

export const rmqUser = process.env.RABBITMQ_USER || "rileone"
export const rmqPass = process.env.RABBITMQ_PASSWORD || "password"
export const rmqhost = process.env.RABBITMQ_HOST || "rabbitmq"