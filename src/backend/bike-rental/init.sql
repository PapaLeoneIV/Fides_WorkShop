CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "bikes" (
    "id" TEXT NOT NULL,
    "road" INTEGER NOT NULL,
    "dirt" INTEGER NOT NULL,
    CONSTRAINT "bikes_pkey" PRIMARY KEY ("id")
);

INSERT INTO "bikes" ("id", "road", "dirt") VALUES
('1', 5000, 6969);

CREATE TABLE "order" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userEmail" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "road_bike_requested" INTEGER,
    "dirt_bike_requested" INTEGER,
    "renting_status" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT now(),
    "updated_at" TIMESTAMPTZ DEFAULT now()
);