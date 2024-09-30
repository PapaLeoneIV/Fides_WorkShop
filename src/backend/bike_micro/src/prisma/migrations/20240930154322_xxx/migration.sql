-- CreateTable
CREATE TABLE "order" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "road_bike_requested" TEXT NOT NULL,
    "dirt_bike_requested" TEXT NOT NULL,
    "renting_status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bikes" (
    "id" TEXT NOT NULL,
    "road" INTEGER NOT NULL,
    "dirt" INTEGER NOT NULL,

    CONSTRAINT "bikes_pkey" PRIMARY KEY ("id")
);
