CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "order" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userEmail" TEXT NOT NULL,

    "to" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "room" TEXT NOT NULL,

    "road_bike_requested" TEXT NOT NULL,
    "dirt_bike_requested" TEXT NOT NULL,

    "amount" TEXT NOT NULL,

    "bike_status" TEXT NOT NULL,
    "hotel_status" TEXT NOT NULL,
    "payment_status" TEXT NOT NULL,


    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now()
); 