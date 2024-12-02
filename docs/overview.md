# Overview

## Project Objectives
This project aims to create an application for booking accommodations and renting bikes, providing a streamlined experience for customers and property owners alike. It achieves this by enabling:
- **Customers** to find, book, and pay for apartments and bike rentals.
- **Property owners** to list their apartments and bikes for rent, manage availability, and track reservations.

## General Composition and High-Level Workflow
The application consists of multiple services working in tandem to deliver a smooth and reliable experience. Each service is responsible for a specific domain, and inter-service communication is managed through an event-driven architecture using RabbitMQ. Here’s a high-level workflow of the application:

1. **User Interaction**: Customers or property owners interact with the frontend.
2. **Service Requests**: The frontend communicates with backend services for requests like booking apartments, renting bikes, or processing payments.
3. **Service Orchestration**: The order service orchestrates interactions between services, such as retrieving user details, checking availability, and managing payments.
4. **Database Updates**: Each service updates its respective database to maintain data consistency.
5. **Notification & Logging**: Key events and activities are logged, and errors trigger alerts to improve monitoring and observability.

## Services
Each service manages its own database and has a dedicated role in the application. Here is a brief overview of each:

- **Bike Rental Service**  
  Manages bike inventory and availability, processing requests for bike rentals.

- **Apartment Booking Service**  
  Handles apartment availability and booking, as well as owner listings.

- **Payment Service**  
  Processes payments for both bike rentals and apartment bookings, integrating with third-party payment providers.

- **User Service**  
  Manages authentication and authorization, handling roles (customer, owner) and user data securely.

- **Order Service**  
  Acts as the central orchestrator, coordinating between services based on user actions (e.g., booking a rental) and updating order statuses accordingly.

- **Frontend Service**  
  The user interface where customers and owners interact with the system, designed in React.

- **RabbitMQ (Message Broker)**  
  Handles inter-service communication, enabling asynchronous messaging for efficient task delegation and reliability.

## Technology Stack

### Frontend
- **React** - for the user interface, delivering a responsive and interactive experience.

### Backend
- **Node.js** - a high-performance, scalable environment for handling service logic and processing.

### Databases
- **PostgreSQL** - each service has its own PostgreSQL instance to ensure data segregation and integrity.

### Messaging
- **RabbitMQ** - an event-driven messaging broker facilitating inter-service communication.

### Containerization & Orchestration
- **Docker & Docker Compose** - for containerizing services and orchestrating multi-container deployment in development and production.

### CI/CD
- **GitHub Actions** - automates code deployment and testing workflows.

### Observability
- **ELK Stack** (Elasticsearch, Logstash, and Kibana) - for log aggregation, processing, and visualization.
- **Prometheus & Grafana** - for metrics monitoring and alerting.

## Architectural Diagram
*(Include architectural diagrams here if available to give an overall picture of the system)*
