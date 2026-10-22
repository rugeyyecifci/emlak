-- CreateTable
CREATE TABLE "Listing" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "rooms" TEXT,
    "areaM2" INTEGER,
    "district" TEXT,
    "status" TEXT NOT NULL DEFAULT 'yayinda',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);
