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

# Start services based on mode
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
        # Wait for dependencies to start
        print("Waiting for databases and RabbitMQ to be ready...")
        time.sleep(20)
    else:
        print("RabbitMQ is already running, skipping...")
    
    
    # Start config service only if it's not already running
    if not is_service_running(CONFIG_SERVICE):
        print(f"Starting {CONFIG_SERVICE}...")
        run_command(f"docker compose up -d {CONFIG_SERVICE}")
        time.sleep(5)  # Allow some time for the config service to start
    else:
        print(f"{CONFIG_SERVICE} is already running, skipping...")

    # Start main services only if they are not already running
    for service in SERVICES:
        if not is_service_running(service):
            print(f"Starting {service}...")
            run_command(f"docker compose up -d {service}")
        else:
            print(f"{service} is already running, skipping...")

    # Always start the frontend service (for integration tests or development) if not already running
    for service in FRONTEND:
        if not is_service_running(service):
            print(f"Starting {service}...")
            run_command(f"docker compose up -d {service}")
            print("Waiting for frontend to be ready...")
            time.sleep(10)  # Adjust the time based on how long it takes for the frontend to start
        else:
            print(f"{service} is already running, skipping...")
    
    
    if mode == "testing":
        print("Running tests...")
        # Replace the following with actual test commands
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
