.PHONY: start_bike_micro start_hotel_micro start_money_micro start_order_micro start_docker_compose start_all

# Define paths to each microservice
BIKE_MICRO_DIR=./src/backend/bike_micro
HOTEL_MICRO_DIR=./src/backend/hotel_micro
MONEY_MICRO_DIR=./src/backend/money_micro
ORDER_MICRO_DIR=./src/backend/order_micro

# Docker Compose target
start_docker_compose:
	docker compose up

# Microservices targets
start_bike_micro:
	cd $(BIKE_MICRO_DIR)  npm install && npx tsx src/index.ts

start_hotel_micro:
	cd $(HOTEL_MICRO_DIR) && npm install && npx tsx src/index.ts

start_money_micro:
	cd $(MONEY_MICRO_DIR) && npm install && npx tsx src/index.ts

start_order_micro:
	cd $(ORDER_MICRO_DIR) && npm install && npx tsx src/index.ts

start_all:
	$(MAKE) -j 4 start_bike_micro start_hotel_micro start_money_micro start_order_micro
