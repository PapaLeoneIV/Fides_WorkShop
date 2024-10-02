/*
  Warnings:

  - You are about to drop the column `bookingDate` on the `date` table. All the data in the column will be lost.
  - You are about to drop the column `dateId` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `isAvailable` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `roomNumber` on the `room` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[booking_date]` on the table `date` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[room_number]` on the table `room` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `booking_date` to the `date` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_id` to the `room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_available` to the `room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `room_number` to the `room` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "room" DROP CONSTRAINT "room_dateId_fkey";

-- DropIndex
DROP INDEX "date_bookingDate_key";

-- DropIndex
DROP INDEX "room_roomNumber_key";

-- AlterTable
ALTER TABLE "date" DROP COLUMN "bookingDate",
ADD COLUMN     "booking_date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "room" DROP COLUMN "dateId",
DROP COLUMN "isAvailable",
DROP COLUMN "roomNumber",
ADD COLUMN     "date_id" INTEGER NOT NULL,
ADD COLUMN     "is_available" BOOLEAN NOT NULL,
ADD COLUMN     "room_number" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "order" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "renting_status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "date_booking_date_key" ON "date"("booking_date");

-- CreateIndex
CREATE UNIQUE INDEX "room_room_number_key" ON "room"("room_number");

-- AddForeignKey
ALTER TABLE "room" ADD CONSTRAINT "room_date_id_fkey" FOREIGN KEY ("date_id") REFERENCES "date"("id") ON DELETE CASCADE ON UPDATE CASCADE;
