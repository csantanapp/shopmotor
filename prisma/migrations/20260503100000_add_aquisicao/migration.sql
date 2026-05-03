CREATE TABLE "clientes_fornecedores" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'PF',
    "nome" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "clientes_fornecedores_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vehicle_aquisicoes" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "proveniencia" TEXT NOT NULL,
    "responsavel" TEXT,
    "clienteFornecedorId" TEXT,
    "valorPago" INTEGER,
    "valorQuitacao" INTEGER,
    "valorFinalAquisicao" INTEGER,
    "valorNotaFiscal" INTEGER,
    "valorMinimoVenda" INTEGER,
    "comissaoTipo" TEXT,
    "comissao" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vehicle_aquisicoes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "vehicle_aquisicoes_vehicleId_key" ON "vehicle_aquisicoes"("vehicleId");
CREATE INDEX "clientes_fornecedores_userId_idx" ON "clientes_fornecedores"("userId");

ALTER TABLE "clientes_fornecedores" ADD CONSTRAINT "clientes_fornecedores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vehicle_aquisicoes" ADD CONSTRAINT "vehicle_aquisicoes_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vehicle_aquisicoes" ADD CONSTRAINT "vehicle_aquisicoes_clienteFornecedorId_fkey" FOREIGN KEY ("clienteFornecedorId") REFERENCES "clientes_fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
