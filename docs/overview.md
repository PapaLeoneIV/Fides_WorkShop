# Overview

## Project Objectives
This project aims to create an application for booking accommodations and renting bikes, providing a streamlined experience for customers and property owners alike. It achieves this by enabling:
- **Customers** to find, book, and pay for apartments and bike rentals.
- **Property owners** to list their apartments and bikes for rent, manage availability, and track reservations.

## General Composition and High-Level Workflow
The application consists of multiple services, each responsible for a specific aspect of the booking and rental process. These services communicate with each other through RabbitMQ messaging and API calls to fulfill user requests. The frontend service provides the user interface for interacting with the application, displaying data, and handling user interactions.

### Request Flow
1. **User Interaction**: A user interacts with the frontend service to search for accommodations or bike rentals, view details, and make a booking.
2. **Frontend Service**: The frontend service sends requests to the appropriate backend services based on the user's actions.
3. **Backend Services**: The backend services handle the requests, process data, and communicate with other services to complete the booking or rental process.
4. **Database Operations**: Each service interacts with its dedicated PostgreSQL database to store and retrieve data related to orders, bookings, users, and properties.
5. **Messaging**: Services communicate with each other through RabbitMQ messaging to update order statuses, handle payments, and manage availability.
6. **Response**: The frontend service receives responses from the backend services and updates the user interface with the latest information.

## Services
Each service manages its own database and has a dedicated role in the application. Here is a brief overview of each service's purpose and core functionalities:

### Configuration service
#### Purpose
The configuration service provides a centralized location for managing configuration settings for other services. It allows services to fetch and update configuration settings based on the service name.

#### Core Functionalities
- **handleConfigRequest**: Fetch configuration settings based on the service name.
- **handleConfigUpdate**: Update configuration settings for a specific service.

#### API Endpoints
- **GET /config/:service**: Retrieve configuration settings for a specific service.
- **POST /config/:service**: Update configuration settings for a specific service.

### Order Service
#### Purpose
The order service is responsible for managing the booking and rental orders, handling order creation, confirmation, and status updates. It communicates with other services to process orders and update order statuses.
#### Core Functionalities
- **handle Order HTTPRequest**
- **handle Confirmation HTTPRequest**

- **handle Order RabbitMQRequest**

- **handle Bike Order RabbitMQResponse**
- **handle Hotel Order RabbitMQResponse**
- **handle Payment RabbitMQResponse**

#### RabbitMQ Messaging
- **Exchanges**: `OrderEventExchange` is the main exchange for each service to publish messages.
- **Queues**: 
  - `order_request_queue`
  - `order_confirm_queue`
- **Routing Keys**:
  - `order.create`
  - `order.confirm`

#### API Endpoints
- **POST /order**: Create a new order based on the request payload.
- **POST /confirm**: Confirm an order and update its status.

#### Dependencies
  - RabbitMQ for message handling.
  - PostgreSQL for order data storage.
  - config-service for configuration management.
  - bike-rental, apt-booking, and payment services for order processing.

### Authentication service
#### Purpose
The authentication service handles user authentication, registration, and token management. It provides endpoints for user login, registration, token refresh, and user information validation.

#### Core Functionalities
- handle Login HTTPRequest
- handle Registration HTTPRequest
- handle JWT Refresh HTTPRequest
- handle User Info validation HTTPRequest

- handle Login RabbitMQRequest
- handle Registration RabbitMQRequest

#### RabbitMQ Messaging
- **Exchanges**: `OrderEventExchange` is the main exchange for each service to publish messages.
- **Queues**: 
  - `login_request_queue`
  - `registration_request_queue`
- **Routing Keys**:
  - `
- **Message Structure**: Messages are JSON objects with specific fields and formats for consistency.

#### API Endpoints
- **POST /login**: Authenticate a user and generate a JWT token.
- **POST /register**: Register a new user and assign a role.
- **POST /refresh**: Refresh the JWT token for an authenticated user.
- **GET /user**: Retrieve user information based on the JWT token.

#### Dependencies
  - RabbitMQ for message handling.
  - PostgreSQL for user data storage.
  - config-service for configuration management.
  - order-service for order exchange setup.
  
### Hotel Booking Service and bike rental service
#### Purpose
The hotel booking service and bike rental service manage the availability, booking, and rental of apartments and bikes, respectively. They handle requests for listing properties, checking availability, and processing bookings or rentals.

#### Core Functionalities
- **handleOrder**
- **handleCancel**

#### RabbitMQ Messaging
- **Exchanges**: `OrderEventExchange` is the main exchange for each service to publish messages.
- **Queues**: 
  - `order_request_queue`
  - `order_cancel_queue`
- **Routing Keys**:
  - `order.create`
  - `order.cancel`

#### API Endpoints
Does not expose any HTTP endpoints. All interactions are through RabbitMQ messages.

#### Dependencies
  - RabbitMQ for message handling.
  - PostgreSQL for apartment data storage.
  - config-service for configuration management.
  - order-service for order exchange setup.

### Payment Service
#### Purpose
The payment service handles payment processing for orders, including payment creation, verification, and status updates. It communicates with other services to process payments and update order statuses.

#### Core Functionalities
- **handlePaymentRequest**

#### RabbitMQ Messaging
- **Exchanges**: `OrderEventExchange` is the main exchange for each service to publish messages.
- **Queues**: 
  - `payment_request_queue`
- **Routing Keys**:
  - `payment.create`

#### API Endpoints
Does not expose any HTTP endpoints. All interactions are through RabbitMQ messages.

### Frontend Service
The frontend service provides the user interface for interacting with the application, displaying data, and handling user interactions. It communicates with backend services through API calls and message subscriptions to update data in real-time.

#### Stack
- **Framework**: React.js
- **State Management**: Redux
- **Styling**: Tailwind CSS

#### Directory Structure
The frontend service follows a standard React project structure with components, pages, and utilities for managing state and UI interactions.
  
## support services

### Database services
The database services provide PostgreSQL databases for storing data related to users, orders, properties, and configurations. Each service has its dedicated database schema and tables for managing data specific to its functionality.

#### config
- **ports**: 5432 : (range 5432-5439)

### RabbitMQ service
The RabbitMQ service provides message queuing and routing capabilities for inter-service communication. It enables services to publish and subscribe to messages for handling asynchronous tasks, event notifications, and data exchange.

#### config
- **ports**: 5672 : 5672

### elasticsearch service
The elasticsearch service provides search functionality for the application, allowing users to search for apartments and bikes based on various criteria. It indexes property data and provides search results based on user queries.

#### config
- **ports**: 9200 : 9200

### kibana service
The kibana service provides a visualization dashboard for monitoring application logs, metrics, and performance. It integrates with Elasticsearch to display real-time data and insights into the application's health and performance.

#### config
- **ports**: 5601 : 5601