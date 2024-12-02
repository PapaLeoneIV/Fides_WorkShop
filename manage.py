import subprocess
import sys
import time

# Define constants for services
DATABASES = ["db_bike_rental", "db_hotel_booking", "db_payment_confirmation", "db_order_management", "db_auth"]
SERVICES = ["authentication-service", "bike-rental-service", "hotel-booking-service", "payment-confirmation-service", "order-management-service"]
FRONTEND = ["frontend"]  # Frontend service to be managed separately
ALL = DATABASES + SERVICES + FRONTEND + ["rabbitmq"]
CONFIG_SERVICE = "config_service"

# Helper function to execute a shell command and capture output
def run_command(command):
    try:
        result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return result.stdout.decode("utf-8")
    except subprocess.CalledProcessError as e:
        print(f"Error: {e.stderr.decode('utf-8')}")
        sys.exit(1)

# Check if a service is already running
def is_service_running(service_name):
    status = run_command(f"docker compose ps {service_name} --services --filter 'status=running'")
    return service_name in status

import requests  # Add this at the top for HTTP requests

# Check if the frontend is effectively up
def is_frontend_ready(url, retries=5, delay=5):
    """
    Check if the frontend service is ready by making HTTP requests to a specific URL.
    Retries the check a few times with a delay between attempts.
    """
    for attempt in range(retries):
        try:
            response = requests.get(url)
            if response.status_code == 200:
                print(f"Frontend is ready after {attempt + 1} attempt(s).")
                return True
            else:
                print(f"Frontend not ready (status: {response.status_code}), retrying...")
        except requests.ConnectionError:
            print("Frontend connection failed, retrying...")
        
        time.sleep(delay)
    
    print("Frontend failed to start after multiple attempts.")
    return False

# Update the start_services function to include the health check
def start_services(mode):
    print(f"Starting services in {mode} mode...")

    # Start databases only if they are not already running
    for db in DATABASES:
        if not is_service_running(db):
            print(f"Starting {db}...")
            run_command(f"docker compose up -d {db}")
        else:
            print(f"{db} is already running, skipping...")

    # Start RabbitMQ only if it's not already running
    if not is_service_running("rabbitmq"):
        print("Starting RabbitMQ...")
        run_command("docker compose up -d rabbitmq")
        print("Waiting for databases and RabbitMQ to be ready...")
        time.sleep(20)
    else:
        print("RabbitMQ is already running, skipping...")

    # Start config service only if it's not already running
    if not is_service_running(CONFIG_SERVICE):
        print(f"Starting {CONFIG_SERVICE}...")
        run_command(f"docker compose up -d {CONFIG_SERVICE}")
        time.sleep(5)
    else:
        print(f"{CONFIG_SERVICE} is already running, skipping...")

    # Start main services only if they are not already running
    for service in SERVICES:
        if not is_service_running(service):
            print(f"Starting {service}...")
            run_command(f"docker compose up -d {service}")
        else:
            print(f"{service} is already running, skipping...")

    # Always start the frontend service if not already running
    for service in FRONTEND:
        if not is_service_running(service):
            print(f"Starting {service}...")
            run_command(f"docker compose up -d {service}")
            print("Waiting for frontend to be ready...")

            # Health check for frontend
            frontend_url = "http://localhost:6969"  # Adjust URL/port as necessary
            if not is_frontend_ready(frontend_url):
                print(f"Error: Frontend service {service} failed to start properly.")
                sys.exit(1)  # Exit script if frontend fails to start
        else:
            print(f"{service} is already running, skipping...")

    if mode == "testing":
        print("Running tests...")
        run_command("docker compose up e2e-testing-service")
    
    print("All services are up!")


# Stop all services
def stop_services():
    print("Stopping all services...")
    run_command(f"docker compose down --remove-orphans")
    print("All services stopped.")

# Main menu
def main():
    if len(sys.argv) < 2:
        print("Usage: python manage.py <command>")
        print("Commands:")
        print("  start-dev     Start the project in development mode")
        print("  start-test    Start the project in testing mode")
        print("  stop          Stop all services")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "start-dev":
        start_services("development")
    elif command == "start-test":
        start_services("testing")
    elif command == "stop":
        stop_services()
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

if __name__ == "__main__":
    main()
