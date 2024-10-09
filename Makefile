.PHONY: all build up down build-bike-rental-service up-bike-rental-service build-hotel-booking-service up-hotel-booking-service build-payment-confirmation-service up-payment-confirmation-service build-order-service up-order-service start_docker_compose start_bike-rental start_hotel-booking

NAME=tra-gency

#---FULL APPLICATION MANAGEMENT---#
all: clean build up

no-volume: clean clean-volumes build up

build:
	docker compose build

clean:
	docker compose down --remove-orphans --volumes
	docker system prune -f

clean-volumes:
	docker volume prune -f

up: clean
	docker compose up


#---BIKE MICROSERVICE MANAGEMENT---#
build-bike-rental:
	docker compose build bike-rental-service

up-bike-rental: clean-bike-rental
	docker compose up -d db_bike_rental
# docker compose up -d rabbitmq
	docker compose up -d elasticsearch
# docker compose up -d logstash
# docker compose up -d kibana
	docker compose up bike-rental-service

bike: clean build-bike-rental up-bike-rental 

clean-bike-rental:
	docker compose down db_bike_rental bike-rental-service --remove-orphans --volumes

#---HOTEL MICROSERVICE MANAGEMENT---#
build-hotel-booking:
	docker compose build hotel-booking-service

up-hotel-booking: clean-hotel-booking
	docker compose up -d db_hotel_booking --remove-orphans
	docker compose up hotel-booking-service --remove-orphans

clean-hotel-booking:
	docker compose down db_hotel_booking hotel-booking-service --remove-orphans --volumes

#---MONEY MICROSERVICE MANAGEMENT---#
build-payment:
	docker compose build payment-confirmation-service

up-payment: clean-payment
	docker compose up -d db_payment_confirmation --remove-orphans
	docker compose up payment-confirmation-service --remove-orphans

clean-payment:
	docker compose down db_payment_confirmation payment-confirmation-service --remove-orphans --volumes

#---ORDER MICROSERVICE MANAGEMENT---#
build-order:
	docker compose build order-management-service

up-order: clean-order
	docker compose up -d db_order_management --remove-orphans
	docker compose up order-management-service --remove-orphans

clean-order:
	docker compose down db_order_management order-management-service --remove-orphans --volumes

#---RabbitMQ MANAGEMENT---#
start_rabbitmq:
	docker compose up rabbitmq