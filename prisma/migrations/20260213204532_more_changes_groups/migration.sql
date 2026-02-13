/*
  Warnings:

  - You are about to drop the column `updateAt` on the `GroupMediaEntry` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `GroupMediaEntry` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GroupMediaEntry" DROP CONSTRAINT "GroupMediaEntry_addedById_fkey";

-- DropIndex
DROP INDEX "GroupMediaEntry_groupId_idx";

-- AlterTable
ALTER TABLE "GroupMediaEntry" DROP COLUMN "updateAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "GroupMediaEntry_groupId_mediaId_idx" ON "GroupMediaEntry"("groupId", "mediaId");

-- AddForeignKey
ALTER TABLE "GroupMediaEntry" ADD CONSTRAINT "GroupMediaEntry_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
