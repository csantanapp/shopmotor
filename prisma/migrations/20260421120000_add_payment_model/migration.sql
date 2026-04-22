-- Rename BoostPlan enum values only if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'BoostPlan' AND enumlabel = 'PUSH') THEN
    ALTER TYPE "BoostPlan" RENAME VALUE 'PUSH' TO 'TURBO';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'BoostPlan' AND enumlabel = 'ELITE') THEN
    ALTER TYPE "BoostPlan" RENAME VALUE 'ELITE' TO 'SUPER_DESTAQUE';
  END IF;
END $$;

-- CreateTable payments
CREATE TABLE IF NOT EXISTS "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "mpPreferenceId" TEXT,
    "mpPaymentId" TEXT,
    "plan" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "payments_mpPaymentId_key" ON "payments"("mpPaymentId");
CREATE INDEX IF NOT EXISTS "payments_userId_idx" ON "payments"("userId");
CREATE INDEX IF NOT EXISTS "payments_vehicleId_idx" ON "payments"("vehicleId");
CREATE INDEX IF NOT EXISTS "payments_mpPaymentId_idx" ON "payments"("mpPaymentId");

ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "payments_userId_fkey";
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "payments_vehicleId_fkey";
ALTER TABLE "payments" ADD CONSTRAINT "payments_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
