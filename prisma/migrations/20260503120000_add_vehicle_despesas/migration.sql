CREATE TABLE "vehicle_despesas" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "valor" INTEGER NOT NULL,
    "clienteFornecedorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vehicle_despesas_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "vehicle_despesas_vehicleId_idx" ON "vehicle_despesas"("vehicleId");
ALTER TABLE "vehicle_despesas" ADD CONSTRAINT "vehicle_despesas_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vehicle_despesas" ADD CONSTRAINT "vehicle_despesas_clienteFornecedorId_fkey" FOREIGN KEY ("clienteFornecedorId") REFERENCES "clientes_fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
