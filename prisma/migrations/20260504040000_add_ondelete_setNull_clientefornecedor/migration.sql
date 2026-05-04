-- AlterTable: add ON DELETE SET NULL to clienteFornecedorId FK in vehicle_aquisicoes
ALTER TABLE "vehicle_aquisicoes" DROP CONSTRAINT IF EXISTS "vehicle_aquisicoes_clienteFornecedorId_fkey";
ALTER TABLE "vehicle_aquisicoes" ADD CONSTRAINT "vehicle_aquisicoes_clienteFornecedorId_fkey"
  FOREIGN KEY ("clienteFornecedorId") REFERENCES "clientes_fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: add ON DELETE SET NULL to clienteFornecedorId FK in vehicle_despesas
ALTER TABLE "vehicle_despesas" DROP CONSTRAINT IF EXISTS "vehicle_despesas_clienteFornecedorId_fkey";
ALTER TABLE "vehicle_despesas" ADD CONSTRAINT "vehicle_despesas_clienteFornecedorId_fkey"
  FOREIGN KEY ("clienteFornecedorId") REFERENCES "clientes_fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
