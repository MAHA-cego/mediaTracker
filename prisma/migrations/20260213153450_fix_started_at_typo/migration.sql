/*
  Warnings:

  - You are about to drop the column `statedAt` on the `MediaEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MediaEntry" DROP COLUMN "statedAt",
ADD COLUMN     "startedAt" TIMESTAMP(3);
