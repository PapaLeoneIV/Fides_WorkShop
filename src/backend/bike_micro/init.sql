-- Enable the uuid-ossp extension if it isn't already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the "bikes" table
CREATE TABLE "bikes" (
    "id" TEXT NOT NULL,
    "road" INTEGER NOT NULL,
    "dirt" INTEGER NOT NULL,
    CONSTRAINT "bikes_pkey" PRIMARY KEY ("id")
);

-- Insert sample data into the "bikes" table
INSERT INTO "bikes" ("id", "road", "dirt") VALUES
('1', 5000, 6969);

-- Create the "order" table
CREATE TABLE "order" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "order_id" TEXT NOT NULL,
    "road_bike_requested" TEXT NOT NULL,
    "dirt_bike_requested" TEXT NOT NULL,
    "renting_status" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now()
);