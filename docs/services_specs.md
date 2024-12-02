# Service Specifications

This document outlines the specifics of each service used in the application, including core functions, exposed ports, configuration requirements, and inter-service dependencies. Each service is described in detail to provide a clear understanding of its role and interactions within the system.

Services are categorized into backend, frontend, and support services, with a focus on the core functions and messaging requirements for each. The service dependency matrix shows how each service relies on others to fulfill its role and process user requests.

## Table of Contents
- [Common Service Features](#common-service-features)
- [Service Specifications](#service-specifications)
    - [Backend Services](#backend-services)
        1. [Bike Rental Service](#bike-rental-service)
        2. [Apartment Booking Service](#apartment-booking-service)
        3. [Payment Service](#payment-service)
        4. [User Service](#user-service)
        5. [Order Service](#order-service)
    - [Frontend Service](#frontend-service)
    - [Support Services](#support-services)
- [Service Dependency Matrix](#service-dependency-matrix)
- [Notes](#notes)

## Common Service Features
- **Messaging**: 
Each service uses RabbitMQ for inter-service communication, with exchanges, queues, and topics defined for message routing. Messages are structured in JSON format for consistency and clarity.
- **Configuration**:
Each service requires environment variables for database connections, external API keys, and messaging settings. These variables are set in .env files for local development (??and provided as secrets in production.)

## Backend Services
Each backend service provides specific functionality for managing rentals, bookings, payments, users, and orders. These services interact with each other through rabbitMQ messaging and API calls to fulfill user requests. 

**Database**: PostgreSQL is used for data storage, with tables and schemas defined for each service's data requirements. Each service has its prisma schema for database interactions.

**Stack**:
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Messaging**: RabbitMQ
- **ORM**: Prisma

### Directory Structure
Each service follows a similar directory structure for consistency and ease of navigation. The main components include controllers, models, services, and configuration files.
```
.
├── Dockerfile
├── init.sql
├── package-lock.json
├── package.json
├── prisma
│   └── schema.prisma
├── src
│   ├── config
│   │   ├── <serviceName>Config.ts          # Connection and service-specific configurations
│   ├── boot
│   │   ├── database.ts                     # Database initialization for Prisma/Postgres
│   │   ├── rabbitmq.ts                     # RabbitMQ setup, including exchanges and queues
│   │   └── index.ts                        # Main initializer to set up dependencies and listeners
│   ├── controllers
│   │   ├── <mainFeature>.controller.ts     # Handlers for primary operations (e.g., order handling)
│   │   └── <otherFeature>.controller.ts    # Additional handlers, such as cancellations or updates
│   ├── repositories
│   |   ├── <mainFeature>Repository.ts  # Main data access object for primary feature
│   |   └── <otherFeature>Repository.ts # Secondary data access object, if needed
│   ├── dtos
│   │   ├── <PrimaryFeatureRequest>.dto.ts  # DTOs defining request format for primary feature
│   │   ├── <PrimaryFeatureResponse>.dto.ts # DTOs defining response format for primary feature
│   │   └── <OtherFeature>.dto.ts           # DTOs for additional data transfer requirements
│   ├── models
│   │   ├── rabbitPublisher.ts              # Model and utilities for publishing messages
│   │   ├── rabbitSubscriber.ts             # Model and utilities for subscribing/consuming messages
│   │   └── index.ts                        # Exports publisher/subscriber models for use in services
│   ├── services
│   │   ├── <mainFeature>Service.ts         # Primary business logic related to main feature
│   │   └── <otherFeature>Service.ts        # Additional business logic (e.g., cancellations)
│   ├── utils
│   |   ├── utilityFunctions.ts                 # Helper functions for parsing, formatting, etc.
│   |   └── schemas
│   |       ├── <ValidationSchema>.ts          # Validation schemas using Joi or Yup
│   └── index.ts                            # Main entry point to start the service
└── tsconfig.json
```

#### Root Files
- `Dockerfile`: Configures the containerized environment for the service. Includes setup instructions for Node.js, Prisma, and any necessary dependencies.
- `init.sql`: Provides database schema initialization for development/testing.
- `package.json / package-lock.json`: Manages dependencies for each service. Each service should have its own `package.json` to control dependencies independently.

#### `/prisma/`
- `schema.prisma`: Defines the database schema, including models, relationships, and mappings for Prisma ORM. Customize this schema according to the service’s database needs.

#### `/src/`
##### `/config/`
- `<serviceName>Config.ts`: Holds service-specific configuration, including RabbitMQ URLs, API keys, and environment variables.
- `statusConfig.ts`: Defines status codes, enums, or shared constants used for handling response statuses across controllers and services.

##### `/bootstrap/`
- `database.ts`: Initializes the database connection, runs migrations, or ensures schema sync if needed. 
- `rabbitmq.ts`: Sets up RabbitMQ, initializes necessary exchanges, queues, and event listeners.
- `index.ts`: The main initialization file for the service; it calls database and RabbitMQ setups, among others.

##### `/controllers/`
- `<mainFeature>.controller.ts`: Contains API endpoint handlers related to the primary feature (e.g., order management).
- `<otherFeature>.controller.ts`: Handles additional or secondary features, such as cancellations or updates.

##### `/repositories/`
- `dbConnection.ts`: Sets up and exports the Postgres or Prisma connection.
- `repositories/`: Contains specific files for each feature’s repository, e.g., `orderRepository.ts`. Repositories handle data transactions, providing methods for CRUD operations.

##### `/dtos/`
- `Data Transfer Objects (DTOs)`: Define the shape of data transferred between the client and server. Typically, each main feature has a request and response DTO file, such as `OrderRequest.dto.ts` and `OrderResponse.dto.ts`.

##### `/models/`
- `rabbitPublisher.ts`: Defines the RabbitMQ publisher, responsible for sending messages to other services.
- `rabbitSubscriber.ts`: Defines the RabbitMQ subscriber, responsible for listening to messages from other services.
- `index.ts`: Exports publisher and subscriber modules, allowing for easy imports across the service.

##### `/schemas/`
- `Validation schemas`: Using libraries like Joi or Yup, each file defines validation rules for request payloads. For example, `bikeRequestSchema.ts` validates bike order requests.

##### `/services/`
- `<mainFeature>Service.ts`: Contains the business logic for the service’s main feature, such as handling new orders.
- `<otherFeature>Service.ts`: Contains additional business logic, such as for cancellations or specialized queries.

##### `/utils/`
- `Utility functions.ts`: Contains helper functions, such as parsing request data, formatting responses, or handling common tasks.

##### `/index.ts`
- `Main entry point`: Starts the service by connecting to RabbitMQ, the database, and initializing routes.

### Bike Rental Service
#### srcs
[backend/bike-rental/](../src/backend/bike-rental/)
#### Purpose
- Handling Order Requests: Processes new bike rental requests, checks availability, creates orders, and sends responses.
- Handling Cancellation Requests: Processes cancellation requests, validates order existence and status, updates inventory, and publishes the cancellation status.
- Checking Bike Availability: Determines if there are enough bikes for a requested order.
- Updating Order Status and Publishing Events: Updates the order's status and publishes this update to other services.

#### Core Functionalities
**handleOrder**: (??)
- Receives a new bike rental request. 
    - `controllers/bike-rental.controller.ts: handleOrderRequest() -> services/bike-rentalService.ts: handleOrder()`
- Validates the request and parses the data.
    - `utils/parseRequest.ts: parseOrderRequest()`
- Checks bike availability.
    - `services/bike-rentalService.ts: checkBikeAvailability()`
- Publishes the order status.
    - `models/rabbitPublisher.ts: updateOrderStatusAndPublish()`

**handleCancel**: (??)
- Receives a bike rental cancellation request.
    - `controllers/bike-rental.controller.ts: handleCancelRequest() -> services/bike-rentalService.ts: handleCancel()`
- Validates the order status and existence.
    - `utils/parseRequest.ts: parseCancelRequest()`
- Publishes the cancellation status.
    - `models/rabbitPublisher.ts: updateOrderStatusAndPublish()`
#### Messaging
- **Exchanges**: `main-exchange` is the main exchange for each service to publish messages.

- **Queues**: `bike-queue` is the queue for processing bike rental requests.

- **Topics**: The service use as routing key `bike.availability` to filter messages from the `order-service`.
**Message Structure**: Messages are JSON objects with specific fields and formats for consistency.
#### Environment Variables:
- Environment Configuration:
    - `NODE_ENV`: Node environment (development, production, test).
- Database Configuration:
    - `POSTGRES_USER`: Postgres username.
    - `POSTGRES_PASSWORD`: Postgres password.
    - `POSTGRES_DB`: Postgres database name.
    - `POSTGRES_HOST`: Postgres host.
    - `POSTGRES_PORT`: Postgres port.
- RabbitMQ Configuration:
    - `RABBITMQ_URL`: URL for connecting to RabbitMQ, including credentials and host information.

- **Dependencies**:
    - RabbitMQ for message handling.
    - PostgreSQL for storing bike rental data.
    - Auth service for user authentication and authorization.
    - Order service for order processing and status updates.
    - Logging service for tracking service events and errors.
  
### Apartment Booking Service
#### srcs
[backend/apt-booking/](../src/backend/apt-booking/)
#### Purpose
- handling Order Requests: Processes new apartment booking requests, checks availability, creates orders, and sends responses.
- Handling Cancellation Requests: Processes cancellation requests, validates order existence and status, updates inventory, and publishes the cancellation status.
- Checking Apartment Availability: Determines if there are enough apartments for a requested order.
- Updating Order Status and Publishing Events: Updates the order's status and publishes this update to other services.
#### Core Functionalities
**handleOrder**:
- Receives a new apartment booking request. 
    - `controllers/apt-booking.controller.ts: handleOrderRequest() -> services/apt-bookingService.ts: handleOrder()`
- Validates the request and parses the data.
    - `utils/parseRequest.ts: parseOrderRequest()`
- Checks apartment availability.
    - `services/apt-bookingService.ts: checkAptAvailability()`
- Publishes the order status.
    - `services/apt-bookingService.ts: updateOrderStatusAndPublish() -> repositories/apt-bookingRepository.ts: updateOrderStatus() | models/rabbitPublisher.ts: publishOrderStatus()`

**handleCancel**: (??)
- Receives an apartment booking cancellation request.
    - `controllers/apt-booking.controller.ts: handleCancelRequest() -> services/apt-bookingService.ts: handleCancel()`
- Validates the order status and existence.
    - `utils/parseRequest.ts: parseCancelRequest()`
- Publishes the cancellation status.
    - `models/rabbitPublisher.ts: updateOrderStatusAndPublish()`
#### Messaging


- **Path**: `backend/apt-booking/`
- **Purpose**: Manage apartment availability, bookings, and listings.
- **Core Functions**:
  - `listApartments`: Retrieve available apartments.
  - `bookApartment`: Book an apartment for a specified period.
  - `updateApartmentStatus`: Update apartment availability status.
- **Ports**:
  - Exposed on **Port 4002** in development.
- **Configuration**:
  - PostgreSQL for apartment data.
  - RabbitMQ for handling inter-service communication.
- **Environment Variables**:
  - `DB_CONNECTION_STRING`: PostgreSQL connection string.
  - `RABBITMQ_URL`: RabbitMQ connection URL.
- **Dependencies**:
  - Receives booking requests from `order-service`.
  - Sends booking confirmation back to `order-service`.

### Payment Service
- **Path**: `backend/payment/`
- **Purpose**: Process payments related to apartment bookings and bike rentals.
- **Core Functions**:
  - `initiatePayment`: Initiate a payment for a booking.
  - `confirmPayment`: Confirm and finalize payment.
  - `refundPayment`: Process a refund (if applicable).
- **Ports**:
  - Exposed on **Port 4003** in development.
- **Configuration**:
  - External API keys for payment gateway integration.
  - PostgreSQL for storing transaction history.
- **Environment Variables**:
  - `DB_CONNECTION_STRING`: Connection string for PostgreSQL.
  - `PAYMENT_GATEWAY_KEY`: API key for the external payment processor.
- **Dependencies**:
  - Listens for payment initiation requests from `order-service`.
  - Sends payment status updates to `order-service`.

### User Service
- **Path**: `backend/user/`
- **Purpose**: Handle user authentication, authorization, and profile management.
- **Core Functions**:
  - `registerUser`: Register a new user (customer or owner).
  - `loginUser`: Authenticate a user and provide a session token.
  - `assignRole`: Assign roles (customer or owner) to users.
- **Ports**:
  - Exposed on **Port 4004** in development.
- **Configuration**:
  - JWT (JSON Web Token) for user sessions.
  - PostgreSQL for storing user data.
- **Environment Variables**:
  - `DB_CONNECTION_STRING`: PostgreSQL connection string.
  - `JWT_SECRET`: Secret key for JWT generation.
- **Dependencies**:
  - Provides authenticated user data to other services for authorization checks.
  - Receives role assignment requests from `order-service`.

### Order Service
- **Path**: `backend/order/`
- **Purpose**: Manage orders, coordinate service interactions, and track order status.
- **Messaging**:
    - **Exchanges & Queues**: 
        - `order-exchange`: Main exchange for order-related messages.
        - `order-queue`: Queue for processing order requests.
        - `order-status-queue`: Queue for updating order status.
    - **Topics & Routing Keys**: Define routing keys each service uses to filter messages, giving a clear map of how topics will keep each queue clean. For example, use keys like order.created or payment.processed to allow each service to focus only on relevant messages.
    - **Message Structure**: List the required fields, formats, and expected data for each message type in a JSON-like structure for consistency.
- **Core Functions**:
  - `createOrder`: Create an order for a booking or rental.
  - `updateOrderStatus`: Update the status of an order based on service responses.
  - `notifyServices`: Coordinate requests across services for each order.
- **Ports**:
  - Exposed on **Port 4005** in development.
- **Configuration**:
  - PostgreSQL for order tracking and status management.
  - RabbitMQ for managing service communication.
- **Environment Variables**:
  - `DB_CONNECTION_STRING`: Connection string for PostgreSQL.
  - `RABBITMQ_URL`: RabbitMQ connection URL.
- **Dependencies**:
  - Communicates with all other services to process orders, retrieve data, and confirm actions.
  - Sends payment, booking, and rental requests to `payment-service`, `apt-booking`, and `bike-rental`.

## Frontend Service
- **Path**: `frontend/`
- **Purpose**: Deliver the user interface for customers and owners.
- **Core Functions**:
  - `displayHomePage`: Show the homepage with available rentals and bookings.
  - `manageBookings`: Allow users to view, edit, or cancel bookings.
  - `login`: Authenticate users and manage session state.
- **Ports**:
  - Exposed on **Port 3000** in development.
- **Configuration**:
  - Environment variables for API endpoints.
  - Authentication settings for secure user sessions.
- **Environment Variables**:
  - `API_BASE_URL`: Base URL for backend service APIs.
- **Dependencies**:
  - Communicates with backend services to fetch data and submit user actions.

---

## Service Dependency Matrix
| Service          | Depends On                   | Purpose of Dependency                       |
|------------------|------------------------------|---------------------------------------------|
| Bike Rental      | Order Service                | To receive reservation requests             |
| Apartment Booking| Order Service                | To receive booking requests                 |
| Payment          | Order Service, External API  | To process payments, validate transactions |
| User             | Order Service                | To handle role-based access and login data  |
| Order            | All Other Services           | To manage and coordinate orders             |
| Frontend         | All Backend Services         | To serve data for UI and handle interactions|

## Notes
- **Alerts**: Specify any special configurations or behaviors that may cause issues, such as unsupported features or limitations.
- **Bound Volumes**: List any volumes that should be mounted in development, along with default mount points.
- **Security Notes**: If there are specific configurations for handling sensitive data, they should be noted here for testing and validation.
