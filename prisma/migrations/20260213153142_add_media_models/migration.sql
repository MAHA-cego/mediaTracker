-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('BOOK', 'LIGHT_NOVEL', 'MANGA', 'MANWHA', 'MANHUA', 'COMIC', 'MOVIE', 'SERIES', 'ANIME', 'VIDEO_GAME', 'OTHER');

-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DROPPED');

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "status" "MediaStatus" NOT NULL DEFAULT 'PLANNED',
    "rating" INTEGER,
    "progress" INTEGER,
    "statedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaEntry_userId_mediaId_key" ON "MediaEntry"("userId", "mediaId");

-- AddForeignKey
ALTER TABLE "MediaEntry" ADD CONSTRAINT "MediaEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaEntry" ADD CONSTRAINT "MediaEntry_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
