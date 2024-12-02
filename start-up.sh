#!/bin/bash

# Define constants
DATABASES=("db_bike_rental" "db_hotel_booking" "db_payment_confirmation" "db_order_management" "db_auth")
SERVICES=("authentication-service" "bike-rental-service" "hotel-booking-service" "payment-confirmation-service" "order-management-service")
FRONTEND="frontend"
CONFIG_SERVICE="config_service"
RABBITMQ="rabbitmq"
FRONTEND_URL="http://localhost:6969"
MODE=""

# Function to check if a service is running
is_service_running() {
    docker compose ps --services --filter "status=running" | grep -q "$1"
}

# Start a service if not already running
start_service() {
    if ! is_service_running "$1"; then
        echo "Starting $1..."
        docker compose up -d "$1"
    else
        echo "$1 is already running, skipping..."
    fi
}

# Check if the frontend is ready
is_frontend_ready() {
    for attempt in {1..10}; do
        if curl -s --head "$FRONTEND_URL" | grep "200 OK" > /dev/null; then
            echo "Frontend is ready!"
            return 0
        else
            echo "Frontend not ready, retrying in 5 seconds..."
            sleep 5
        fi
    done
    echo "Frontend failed to start properly."
    return 1
}

# Start services
start_services() {
    echo "Starting services in $1 mode..."
    
    # Start databases
    for db in "${DATABASES[@]}"; do
        start_service "$db"
    done

    # Start RabbitMQ
    start_service "$RABBITMQ"
    sleep 5  # Give time for RabbitMQ and DBs to initialize

    # Start config service
    start_service "$CONFIG_SERVICE"

    # Start main services
    for service in "${SERVICES[@]}"; do
        start_service "$service"
    done

    # Start frontend and check readiness
    start_service "$FRONTEND"
    if ! is_frontend_ready; then
        echo "Error: Frontend service failed to start properly."
        exit 1
    fi

    # Run tests if in testing mode
    if [[ "$1" == "testing" ]]; then
        echo "Running tests..."
        docker compose up e2e-testing-service
    fi

    echo "All services are up!"
}

stop_services() {
    echo "Stopping all services..."
    docker compose down --remove-orphans
    echo "All services stopped."
}

if [[ $# -lt 1 ]]; then
    echo "Usage: ./manage.sh <command>"
    echo "Commands:"
    echo "  dev     Start the project in development mode"
    echo "  test    Start the project in testing mode"
    echo "  stop          Stop all services"
    exit 1
fi

case "$1" in
    dev)
        MODE="development"
        start_services "$MODE"
        ;;
    test)
        MODE="testing"
        start_services "$MODE"
        ;;
    stop)
        stop_services
        ;;
    *)
        echo "Unknown command: $1"
        exit 1
        ;;
esac
