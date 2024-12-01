/*
  Warnings:

  - Added the required column `userEmail` to the `order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order" ADD COLUMN     "userEmail" TEXT NOT NULL;
