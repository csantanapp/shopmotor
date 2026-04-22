-- CreateEnum
CREATE TYPE "BoostLevel" AS ENUM ('NONE', 'DESTAQUE', 'ELITE');

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "boostLevel" "BoostLevel" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "boostUntil" TIMESTAMP(3);
