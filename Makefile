DATABASES = db_bike_rental db_hotel_booking db_payment_confirmation db_order_management
SERVICES = bike-rental-service hotel-booking-service payment-confirmation-service order-management-service
ALL = $(DATABASES) $(SERVICES) rabbitmq
DATE = $(shell date +%Y-%m-%d:%H:%M:%S)
STATUS_LOG = .status.log
STATUS_CNT_LOG = .status_cnt.log
CURRENT_DIR = $(shell basename $(shell pwd))
NETWORK = $(CURRENT_DIR)_app_network

# --- STATUS AND MONITORING --- #
status:
	@echo "===== Status Report =====" >> $(STATUS_LOG)
	@echo "===== Date: $(DATE) =====" >> $(STATUS_LOG)
	@echo "===== Docker Compose Version =====" >> $(STATUS_LOG)
	@docker compose version >> $(STATUS_LOG)
	@echo "===== Container Status =====" >> $(STATUS_LOG)
	@docker compose ps --all >> $(STATUS_LOG)
	@for service in $(ALL); do \
		if [ -z $$(docker compose ps $$service --services --filter "status=running") ]; then \
			echo "$$service is not running" >> $(STATUS_LOG); \
		fi; \
	done
	@echo "===== Resource Usage =====" >> $(STATUS_LOG)
	@docker compose stats --no-stream >> $(STATUS_LOG)
	@echo "===== Public Ports =====" >> $(STATUS_LOG)
	@for service in $(SERVICES); do \
		echo "$$service: $$(docker compose port $$service 80 || echo 'Not exposed')" >> $(STATUS_LOG); \
	done
	@echo "===== Logs =====" >> $(STATUS_LOG)
	@docker compose logs --tail=5 >> $(STATUS_LOG)
	@echo "===== Running Processes =====" >> $(STATUS_LOG)
	@docker compose top >> $(STATUS_LOG)

clear-status:
	@echo "Clearing status logs..."
	@rm -f $(STATUS_LOG)

# --- CONTAINERS --- #
status-containers:
	@echo "===== Container Information =====" >> $(STATUS_CNT_LOG)
	@docker ps --all >> $(STATUS_CNT_LOG)
	@echo "===== Container Details =====" >> $(STATUS_CNT_LOG)
	@docker inspect $(shell docker ps -aq) >> $(STATUS_CNT_LOG)

clear-status-cnt:
	@echo "Clearing container status logs..."
	@rm -f $(STATUS_CNT_LOG)

# --- NETWORK --- #
status-network:
	@echo "===== Network Information ====="
	@docker network ls
	@echo "===== Network Details ====="
	@docker network inspect $(NETWORK)

# --- VOLUMES --- #
status-volumes:
	@echo "===== Volume Information ====="
	@docker volume ls
	@echo "===== Volume Details ====="
	@docker volume inspect $(shell docker volume ls -q)

# --- BUILD --- #
build-container:
	@echo "Building container..."
	@if [ -z $(CNT) ]; then \
		echo "CNT is not set (CNT=container_name)"; \
		exit 1; \
	fi
	docker compose build $(CNT)

build-services:
	@echo "Building services..."
	docker compose build $(SERVICES)

# --- STARTUP --- #
up-container:
	@echo "Starting container..."
	@if [ -z $(CNT) ]; then \
		echo "CNT is not set (CNT=container_name)"; \
		exit 1; \
	fi
	docker compose up -d $(CNT)

up-db:
	@echo "Starting databases..."
	docker compose up -d $(DATABASES)

up-rabbitmq:
	@echo "Starting RabbitMQ..."
	docker compose up -d rabbitmq

up-services:
	@echo "Starting services..."
	docker compose up -d $(SERVICES)

up: up-db up-rabbitmq
	@bash -c "echo 'Waiting for databases and RabbitMQ to start...' && sleep 20"
	@make up-services

# --- RESTART --- #
restart-container:
	@echo "Restarting container..."
	@if [ -z $(CNT) ]; then \
		echo "CNT is not set (CNT=container_name)"; \
		exit 1; \
	fi
	docker compose restart $(CNT)

restart-db:
	@echo "Restarting databases..."
	docker compose restart $(DATABASES)

restart-rabbitmq:
	@echo "Restarting RabbitMQ..."
	docker compose restart rabbitmq

restart-services:
	@echo "Restarting services..."
	docker compose restart $(SERVICES)

restart: restart-db restart-rabbitmq
	@bash -c "sleep 20"
	@make restart-services

# --- SHUTDOWN --- #
down-container:
	@echo "Stopping container..."
	@if [ -z $(CNT) ]; then \
		echo "CNT is not set (CNT=container_name)"; \
		exit 1; \
	fi
	docker compose down $(CNT) --remove-orphans

down-db:
	@echo "Stopping databases..."
	docker compose down $(DATABASES) --remove-orphans

down-rabbitmq:
	@echo "Stopping RabbitMQ..."
	docker compose down rabbitmq --remove-orphans

down-services:
	@echo "Stopping services..."
	docker compose down $(SERVICES) --remove-orphans

down: down-db down-rabbitmq down-services
	@echo "Bringing down all containers..."

# --- CLEANUP --- #
clean-container:
	@echo "Removing containers..."
	@if [ -z $(CNT) ]; then \
		echo "CNT is not set (CNT=container_name)"; \
		exit 1; \
	fi
	docker compose rm -fs $(CNT)

clean-db: down-db
	@echo "Removing databases..."
	docker compose rm -fs $(DATABASES)

clean-rabbitmq: down-rabbitmq
	@echo "Removing RabbitMQ..."
	docker compose rm -fs rabbitmq

clean-services: down-services
	@echo "Removing services..."
	docker compose rm -fs $(SERVICES)

clean: clean-db clean-rabbitmq clean-services

fclean: clean
	@echo "Removing all services and volumes..."
	docker compose down --volumes --remove-orphans