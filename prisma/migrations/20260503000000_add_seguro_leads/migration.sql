CREATE TABLE IF NOT EXISTS "seguro_leads" (
    "id" TEXT NOT NULL,
    "tipoVeiculo" TEXT NOT NULL DEFAULT 'carro',
    "zeroKm" BOOLEAN NOT NULL DEFAULT false,
    "placa" TEXT,
    "ano" TEXT NOT NULL DEFAULT '',
    "marca" TEXT NOT NULL DEFAULT '',
    "modelo" TEXT NOT NULL DEFAULT '',
    "versao" TEXT,
    "usoComercial" BOOLEAN NOT NULL DEFAULT false,
    "blindado" BOOLEAN NOT NULL DEFAULT false,
    "kitGas" BOOLEAN NOT NULL DEFAULT false,
    "beneficioFiscal" BOOLEAN NOT NULL DEFAULT false,
    "cep" TEXT NOT NULL DEFAULT '',
    "condutorJovem" BOOLEAN NOT NULL DEFAULT false,
    "possuiSeguro" BOOLEAN NOT NULL DEFAULT false,
    "classeBonus" TEXT,
    "vencimentoSeguro" TEXT,
    "tipoPessoa" TEXT NOT NULL DEFAULT 'pf',
    "nomeSocial" TEXT,
    "nome" TEXT NOT NULL DEFAULT '',
    "cpfCnpj" TEXT NOT NULL DEFAULT '',
    "razaoSocial" TEXT,
    "nomeFantasia" TEXT,
    "nascimento" TEXT,
    "email" TEXT NOT NULL DEFAULT '',
    "telefone" TEXT NOT NULL DEFAULT '',
    "principalMotorista" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'novo',
    "leadTipo" TEXT NOT NULL DEFAULT 'comum',
    "storeSlug" TEXT,
    "storeUserId" TEXT,
    "vehicleId" TEXT,
    "origem" TEXT NOT NULL DEFAULT 'ShopMotor Seguro',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seguro_leads_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "seguro_leads_status_idx" ON "seguro_leads"("status");
CREATE INDEX IF NOT EXISTS "seguro_leads_createdAt_idx" ON "seguro_leads"("createdAt");
CREATE INDEX IF NOT EXISTS "seguro_leads_email_idx" ON "seguro_leads"("email");
CREATE INDEX IF NOT EXISTS "seguro_leads_storeUserId_idx" ON "seguro_leads"("storeUserId");
