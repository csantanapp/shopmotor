-- CreateTable store_subscriptions
CREATE TABLE IF NOT EXISTS "store_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "mpPaymentId" TEXT,
    "mpPreferenceId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "store_subscriptions_mpPaymentId_key" ON "store_subscriptions"("mpPaymentId");
CREATE INDEX IF NOT EXISTS "store_subscriptions_userId_status_idx" ON "store_subscriptions"("userId", "status");
CREATE INDEX IF NOT EXISTS "store_subscriptions_endsAt_idx" ON "store_subscriptions"("endsAt");

ALTER TABLE "store_subscriptions" DROP CONSTRAINT IF EXISTS "store_subscriptions_userId_fkey";
ALTER TABLE "store_subscriptions" ADD CONSTRAINT "store_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable financiamento_leads
CREATE TABLE IF NOT EXISTS "financiamento_leads" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "nascimento" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "prazo" TEXT NOT NULL,
    "valorCarro" DOUBLE PRECISION NOT NULL,
    "entrada" DOUBLE PRECISION NOT NULL,
    "financiado" DOUBLE PRECISION NOT NULL,
    "parcelas" INTEGER NOT NULL,
    "pmt" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'novo',
    "storeSlug" TEXT,
    "storeUserId" TEXT,
    "vehicleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financiamento_leads_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "financiamento_leads_status_idx" ON "financiamento_leads"("status");
CREATE INDEX IF NOT EXISTS "financiamento_leads_createdAt_idx" ON "financiamento_leads"("createdAt");
CREATE INDEX IF NOT EXISTS "financiamento_leads_storeUserId_idx" ON "financiamento_leads"("storeUserId");
