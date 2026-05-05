-- AlterTable: add OLX integration fields to vehicles
ALTER TABLE "vehicles"
  ADD COLUMN IF NOT EXISTS "olxAdId"        TEXT,
  ADD COLUMN IF NOT EXISTS "olxStatus"      TEXT,
  ADD COLUMN IF NOT EXISTS "olxPublishedAt" TIMESTAMP(3);
