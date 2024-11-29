#!/bin/bash

# Array of Docker service names
services=("bike-rental-service" "hotel-booking-service" "payment-confirmation-service" "order-management-service")

# Ports to be used
ports=("5555" "5556" "5557" "5558")

# Loop through each service and port
for i in "${!services[@]}"; do
    service=${services[$i]}
    port=${ports[$i]}
    echo "Launching prisma studio for $service on port $port"
    sudo docker-compose exec -d "$service" npx prisma studio -p "$port" &
done

# Wait for all background processes to finish
wait
