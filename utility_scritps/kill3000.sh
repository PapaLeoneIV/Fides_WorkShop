#!/bin/bash

# Define an array of ports
ports="3000 3001 3002 3003 5672"

# Iterate over each port
for port in $ports; do
  # Find the PID of the process listening on the port
  pid=$(sudo lsof -t -i :$port)
  
  # If a process is found, kill it
  if [ -n "$pid" ]; then
    echo "Killing process $pid on port $port"
    sudo kill -9 $pid
  else
    echo "No process found on port $port"
  fi
done
