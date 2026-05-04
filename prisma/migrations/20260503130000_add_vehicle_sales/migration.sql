CREATE TABLE "vehicle_sales" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "soldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valorVenda" INTEGER,
    "buyerNome" TEXT,
    "buyerDocumento" TEXT,
    "buyerTelefone" TEXT,
    "buyerEmail" TEXT,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vehicle_sales_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "vehicle_sales_vehicleId_key" ON "vehicle_sales"("vehicleId");
ALTER TABLE "vehicle_sales" ADD CONSTRAINT "vehicle_sales_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
