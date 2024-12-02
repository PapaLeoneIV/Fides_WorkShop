# Service Specifications

This document outlines the specifics of each service used in the application, including core functions, exposed ports, configuration requirements, and inter-service dependencies. Each service is described in detail to provide a clear understanding of its role and interactions within the system.

Services are categorized into backend, frontend, and support services, with a focus on the core functions and messaging requirements for each. The service dependency matrix shows how each service relies on others to fulfill its role and process user requests.

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
Each backend service follows a similar directory structure for consistency and ease of navigation. The main components include controllers, models, services, and configuration files.
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
│   │   ├── rabbit-config.ts          # Connection and service-specific configurations
│   │   └── logger-config.ts          # Logging configuration for service events
│   ├── boot
│   │   ├── initialize-database.ts                     # Database initialization for Prisma/Postgres
│   │   ├── initialize-rabbitmq.ts                     # RabbitMQ setup, including exchanges and queues
│   │   └── bootService.ts                        # Main initializer to set up dependencies and listeners
│   ├── controllers
│   │   ├── <mainFeature>-controller.ts     # Handlers for primary operations (e.g., order handling)
│   │   └── <otherFeature>-controller.ts    # Additional handlers, such as cancellations or updates
│   ├── repositories
│   |   ├── <mainFeature>-repository.ts  # Main data access object for primary feature
│   |   └── <otherFeature>-repository.ts # Secondary data access object, if needed
│   ├── dtos
│   │   ├── <PrimaryFeatureRequest>DTO.ts  # DTOs defining request format for primary feature
│   │   ├── <PrimaryFeatureResponse>DTO.ts # DTOs defining response format for primary feature
│   │   └── <OtherFeature>DTO.ts           # DTOs for additional data transfer requirements
│   ├── models
│   │   ├── databaseClient.ts             # Model and utilities for subscribing/consuming messages
│   │   ├── rabbitPublisher.ts              # Model and utilities for publishing messages
│   │   ├── rabbitSubscriber.ts             # Model and utilities for subscribing/consuming messages
│   │   └── rabbitClient.ts                        # Exports publisher/subscriber models for use in services
│   ├── services
│   │   ├── <mainFeature>-service.ts         # Primary business logic related to main feature
│   │   └── <otherFeature>-service.ts        # Additional business logic (e.g., cancellations)
│   ├── schemas
│   |   └── <ValidationSchema>.ts          # Validation schemas using Zod
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
- `<mainFeature>-controller.ts`: Contains API endpoint handlers related to the primary feature (e.g., order management).
- `<otherFeature>-controller.ts`: Handles additional or secondary features, such as cancellations or updates.

##### `/repositories/`
- `<table>-repository`: Contains specific files for each feature’s repository, e.g., `orderRepository.ts`. Repositories handle data transactions, providing methods for CRUD operations.

##### `/dtos/`
- `Data Transfer Objects (DTOs)`: Define the shape of data transferred between the client and server. Typically, each main feature has a request and response DTO file, such as `OrderRequestDTO.ts` and `OrderResponseDTO.ts`.

##### `/models/`
- `rabbitPublisher.ts`: Defines the RabbitMQ publisher, responsible for sending messages to other services.
- `rabbitSubscriber.ts`: Defines the RabbitMQ subscriber, responsible for listening to messages from other services.
- `rabbitmqClient.ts`: Exports publisher and subscriber modules, allowing for easy imports across the service.

##### `/schemas/`
- `Validation schemas`: Using libraries like Joi or Yup, each file defines validation rules for request payloads. For example, `bikeRequestSchema.ts` validates bike order requests.

##### `/services/`
- `<mainFeature>-service.ts`: Contains the business logic for the service’s main feature, such as handling new orders.
- `<otherFeature>-service.ts`: Contains additional business logic, such as for cancellations or specialized queries.

##### `/index.ts`
- `Main entry point`: Starts the service by connecting to RabbitMQ, the database, and initializing routes.