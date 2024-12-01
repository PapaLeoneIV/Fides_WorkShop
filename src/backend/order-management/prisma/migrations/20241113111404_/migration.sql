-- CreateTable
CREATE TABLE "order" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "road_bike_requested" INTEGER NOT NULL,
    "dirt_bike_requested" INTEGER NOT NULL,
    "amount" TEXT NOT NULL,
    "bike_status" TEXT NOT NULL,
    "hotel_status" TEXT NOT NULL,
    "payment_status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);
