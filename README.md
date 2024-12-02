# Fides WorkShop Project
This is the repository for the Fides Workshop project.
We organize the work in order to acomplish the projects main goals:

- [X] Create a backend using a microservice architecture with Node and ExpressJS
- [X] Frontend developed with NextJS as a simple interface for the backend
- [X] Organized work and directory around Layered Architecture
- [X] Use of various Design Patterns (Repository Patterns, State Pattern, Saga Pattern, ...) 
- [X] Async communication between microservices through RabbitMQ
- [X] Sync communication between Client-Server with HTTP Req/Res
- [X] Auth/Registration with JWT Token
- [X] Developed Distributed Database System
- [X] Developed SAGA PATTERN to handle cancellation of orders
- [X] Have the environment Dockerized
- [ ] Set up an ELK stack to monitor the services

## Contributors
- [Riccardo Leone](https://github.com/PapaLeoneIV)
- [Emma Veronelli](https://github.com/minestrinad)

## Build prerequisites
To build the project you need to have the following tools installed on your machine:
- `python3`
- `docker`

## Architecture
The project is divided in two main parts:
- The backend, which is a microservice architecture
- The frontend, which is a simple web application

### Backend
The backend is composed by four business services:
- The authentication service (auth) which is responsible for the authentication of the users
- The Order management service (order) which is responsible for the management of the orders
- The bike rental service (bike) which is responsible for the management of the bike rentals
- The Hotel booking service (hotel) which is responsible for the management of the hotel bookings
And others helper services:
- A database service for each business service
- The RabbitMQ service which is responsible for the communication between the services
- The ELK stack which is responsible for the monitoring of the services

### Macro View of MicroService Architecture
![docs/images/GeneralMicroArchitecture](./docs/images/GeneralMicroArchitecture.png)

### Macro View of MicroService Communication Architecture
![docs/images/CommunicationArchitecture](./docs/images/CommunicationArchitecture.png)

### Frontend
The frontend is a simple web application that allows the user to interact with the backend services.

## URLs
- **http::/localhost:6969/auth/register** (Used to register a User)
- **http::/localhost:6969/auth/login** (Used to Login a User)
- **http::/localhost:6969/homepage** (Page to insert the order)
- **http::/localhost:6969/summary** (Page where the Order Result is shown)


## How to run the project
The project is still in development, so the only way to run it is to run it in development mode.
To run the project you need to have docker installed on your machine.
Once you have docker installed you can run the following command in the root directory of the project:

```bash
python3 manage.py start-dev
```

To stop the project you can run the following command in the root directory of the project:
```bash
python3 manage.py stop
```
