-- CreateEnum
CREATE TYPE "BoostPlan" AS ENUM ('NONE', 'PUSH', 'DESTAQUE', 'ELITE');

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "boostGalleryUntil" TIMESTAMP(3),
ADD COLUMN     "boostPlan" "BoostPlan" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "boostTopUntil" TIMESTAMP(3);
