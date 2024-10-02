#!/bin/bash

i=1
while [ $i -le 100 ]
do
  road_bike=$((i % 10 + 1))
  dirt_bike=$((i % 5 + 1))
  room=$((100 + i))
  from=$(date -d "$i days" +%Y-%m-%d)
  to=$(date -d "$((i + 1)) days" +%Y-%m-%d)

  curl -X POST http://localhost:3003/order/book_vacation \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "1000",
    "road_bike_requested": "'$road_bike'",
    "dirt_bike_requested": "'$dirt_bike'",
    "to": "'$to'",
    "from": "'$from'",
    "room": "'$room'"
  }' &

  i=$((i + 1))
done

wait
