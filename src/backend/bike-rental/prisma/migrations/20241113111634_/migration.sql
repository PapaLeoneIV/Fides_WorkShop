/*
  Warnings:

  - Added the required column `userEmail` to the `order` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `road_bike_requested` on the `order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `dirt_bike_requested` on the `order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "order" ADD COLUMN     "userEmail" TEXT NOT NULL,
DROP COLUMN "road_bike_requested",
ADD COLUMN     "road_bike_requested" INTEGER NOT NULL,
DROP COLUMN "dirt_bike_requested",
ADD COLUMN     "dirt_bike_requested" INTEGER NOT NULL;
