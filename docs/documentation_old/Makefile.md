## Usage

### 1. **STATUS AND MONITORING**

These commands provide information about the status of your Docker services and resources:

- **`make status`**: Generates a status report for all services and saves it to `.status.log`.
- **`make clear-status`**: Clears the `.status.log` file.
- **`make status-containers`**: Outputs detailed container information to `.status_cnt.log`.
- **`make clear-status-cnt`**: Clears the `.status_cnt.log` file.
- **`make status-network`**: Shows details of all Docker networks and inspects the project-specific network.
- **`make status-volumes`**: Lists and inspects Docker volumes.

### 2. **CONTAINERS**

These commands manage individual containers:

- **`make status-containers`**: Logs information about all containers to `.status_cnt.log`.
- **`make build-container`**: Builds a specific container. Set `CNT=container_name` to specify the container.
- **`make up-container`**: Starts a specific container. Set `CNT=container_name`.
- **`make restart-container`**: Restarts a specific container. Set `CNT=container_name`.
- **`make down-container`**: Stops a specific container. Set `CNT=container_name`.
- **`make clean-container`**: Removes a specific container. Set `CNT=container_name`.

### 3. **DATABASES**

These commands manage all database containers:

- **`make up-db`**: Starts all database containers.
- **`make restart-db`**: Restarts all database containers.
- **`make down-db`**: Stops all database containers.
- **`make clean-db`**: Stops and removes all database containers.

### 4. **RabbitMQ**

Manage RabbitMQ, which acts as a message broker for services:

- **`make up-rabbitmq`**: Starts the RabbitMQ container.
- **`make restart-rabbitmq`**: Restarts the RabbitMQ container.
- **`make down-rabbitmq`**: Stops the RabbitMQ container.
- **`make clean-rabbitmq`**: Stops and removes the RabbitMQ container.

### 5. **SERVICES**

Manage all application services:

- **`make build-services`**: Builds all service containers.
- **`make up-services`**: Starts all service containers.
- **`make restart-services`**: Restarts all service containers.
- **`make down-services`**: Stops all service containers.
- **`make clean-services`**: Stops and removes all service containers.

### 6. **STARTUP AND SHUTDOWN**

Manage the startup and shutdown of all containers:

- **`make up`**: Starts databases, RabbitMQ, and all services. It includes a delay to ensure databases and RabbitMQ start first.
- **`make restart`**: Restarts all databases, RabbitMQ, and services.
- **`make down`**: Brings down all containers (databases, RabbitMQ, and services).

### 7. **CLEANUP**

Remove containers and volumes:

- **`make clean`**: Stops and removes all services, databases, and RabbitMQ containers.
- **`make fclean`**: Stops and removes all containers and their volumes.

## Logging

All status logs are saved as follows:
- `.status.log`: Main status report log.
- `.status_cnt.log`: Container information log.

To clear these logs, use:
```bash
make clear-status
make clear-status-cnt
```

## Example Commands

```bash
# Start all containers (databases, RabbitMQ, services)
make up

# Check the status of all containers and services
make status

# Restart a single container (e.g., bike-rental-service)
make restart-container CNT=bike-rental-service

# Stop all containers and remove volumes
make fclean
```