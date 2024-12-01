# Docker Architecture and Setup
## 1. Introduction

### Purpose
This document serves as a guide to the Docker-based development environment for our microservices application. It is intended for developers and team members who will be working on the project.

### Overview
Our application leverages Docker and Docker Compose to orchestrate a microservices architecture composed of several backend services, each with its own database. The key tools and technologies used include:

- **Docker**: Containerization platform to package applications.
- **Docker Compose**: Tool for defining and running multi-container Docker applications.
- **Node.js**: Runtime environment for executing JavaScript code server-side.
- **PostgreSQL**: Relational database management system for each microservice.
- **RabbitMQ**: Message broker for inter-service communication.

## 2. System Architecture Overview

### Diagram
![Microservices Architecture Diagram](Architecture/microservice.drawio)

*(Please refer to `microservice.drawio` in the `documentation/Architecture` folder for the visual representation of the system architecture.)*

### Components
Our application consists of the following components:

#### Backend Services
1. **Bike Rental Service (`bike-rental-service`)**
   - Manages bike rental operations.
   - Connects to its own PostgreSQL database (`db_bike_rental`).
   - Binds to port `3000` for local access.

2. **Hotel Booking Service (`hotel-booking-service`)**
   - Handles hotel booking functionalities.
   - Connects to its own PostgreSQL database (`db_hotel_booking`).
   - Binds to port `3001` for local access.

3. **Payment Confirmation Service (`payment-confirmation-service`)**
   - Processes payment confirmations.
   - Connects to its own PostgreSQL database (`db_payment_confirmation`).
   - Binds to port `3002` for local access.

4. **Order Management Service (`order-management-service`)**
   - Manages customer orders.
   - Connects to its own PostgreSQL database (`db_order_management`).
   - Binds to port `3003` for local access.

#### Databases
Each backend service has its own PostgreSQL database for data isolation and integrity.

- **db_bike_rental**
- **db_hotel_booking**
- **db_payment_confirmation**
- **db_order_management**

#### Message Broker
- **RabbitMQ**
  - Facilitates asynchronous communication between services.
  - Accessible on ports `5672` (AMQP) and `15672` (management console).
  
*(Note: Configuration for logging is in progress, as per the latest updates.)*

#### Networks and Volumes
- **Network: `app_network`**
  - A Docker network that allows all services to communicate internally.

- **Volumes**
  - **Database Volumes**
    - Persist data for each PostgreSQL instance.

## 3. Docker Setup
-
### Docker Installation
Ensure you have Docker and Docker Compose installed on your machine.

**Docker Installation Guide**: [Get Docker](https://docs.docker.com/get-docker/)

### Repository Structure
The project repository is organized as follows:

```plaintext
.
├── Makefile
├── config
│   ├── client.js
│   ├── grafana-datasources.yml
│   └── promtail.yaml
├── docker-compose.yml
├── documentation
│   ├── Architecture
│   ├── Implementation
│   ├── Enities
│   ├── DockerArchitecture.md
│   └── endpoints.txt
├── src
│   └── backend
│       ├── bike-rental
│       ├── hotel-booking
│       ├── order-management
│       └── payment-confirmation
└── stresstest.sh
```

- **`docker-compose.yml`**: Located at the root, defines all the services.
- **`src/backend`**: Contains source code for each backend microservice.
- **`config`**: Configuration files for logging, monitoring, and other services.
- **`documentation`**: Documentation files and diagrams.

### .env File
Create a `.env` file in the root directory to store environment variables used by `docker-compose.yml`.

Example `.env` file:

```dotenv
# Node Environment
NODE_ENV=development

# PostgreSQL Credentials
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_PORT=5432

# Database Names
POSTGRES_DB_BIKE=bike_rental_db
POSTGRES_DB_HOTEL=hotel_booking_db
POSTGRES_DB_PAYMENT=payment_confirmation_db
POSTGRES_DB_ORDER=order_management_db

# RabbitMQ Credentials
RABBITMQ_USER=your_rabbitmq_user
RABBITMQ_PASSWORD=your_rabbitmq_password
```

*(Ensure you replace placeholder values with actual credentials.)*

## 4. How to Start/Stop Services
- **Start Services**

  ```bash
  docker-compose up -d
  ```

  The `-d` flag runs the containers in detached mode.

- **Stop Services**

  ```bash
  docker-compose down
  ```

- **Rebuild Services**

  If you've made changes to the Dockerfiles or dependencies:

  ```bash
  docker-compose up --build -d
  ```

## 5. Development Workflow

### Running Services Locally
We use Docker volumes to map the local source code into the containers, allowing you to edit code locally and see changes reflected in the running services.

For example, in `bike-rental-service`:

```yaml
volumes:
  - ./src/backend/bike-rental:/app
  - ./src/backend/bike-rental/package.json:/app/package.json
```

This maps your local `bike-rental` service code to the `/app` directory inside the container.

### Rebuilding Containers
After making changes to dependencies or Dockerfiles, rebuild the containers:

```bash
docker-compose build
docker-compose up -d
```

Alternatively, combine both commands:

```bash
docker-compose up --build -d
```

### Handling Logs
View logs for a specific service:

  ```bash
  docker logs -f bike-rental-service
  ```
### Service Health and Monitoring
Check Running Containers

  ```bash
  docker ps
  ```

## 6. Testing and Debugging
### Access APIs
[endpoints.txt](endpoints.txt) contains the endpoints for each service.

### Access Databases
You can connect to the PostgreSQL databases using a client like `psql` or a GUI tool, using the exposed ports:

  - `db_bike_rental`: Port `5433`
  - `db_hotel_booking`: Port `5434`
  - `db_payment_confirmation`: Port `5435`
  - `db_order_management`: Port `5436`

### Common Issues and Troubleshooting

- **Container Crashes**

  Check logs using `docker logs` to identify errors.

- **Port Conflicts**

  Ensure no other services are running on the host ports defined in `docker-compose.yml`.



## 7. Deployment Considerations
### Development vs. Production

  - In development, we mount local directories and expose services on host ports for easy access.
  - In production, you'd remove volume mounts and host port mappings, relying on internal Docker networking and built images.


### Production Build
  - In production, remove development-specific configurations:
    - Remove volume mounts to prevent code changes in the container.
    - Use `npm run build` and `npm run start` in the `Dockerfile` and `docker-compose.yml`.

### Security
  - Secure environment variables and secrets.

### Scaling
  - Use orchestration tools like Kubernetes for scaling services if necessary.
