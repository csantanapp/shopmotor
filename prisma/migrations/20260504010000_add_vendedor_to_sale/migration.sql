ALTER TABLE "vehicle_sales" ADD COLUMN "vendedorId" TEXT;
ALTER TABLE "vehicle_sales" ADD CONSTRAINT "vehicle_sales_vendedorId_fkey"
  FOREIGN KEY ("vendedorId") REFERENCES "vendedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
