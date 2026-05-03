ALTER TABLE "clientes_fornecedores" ADD COLUMN IF NOT EXISTS "telefone" TEXT;
ALTER TABLE "clientes_fornecedores" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "clientes_fornecedores" ADD COLUMN IF NOT EXISTS "endereco" TEXT;
ALTER TABLE "clientes_fornecedores" ADD COLUMN IF NOT EXISTS "cidade" TEXT;
ALTER TABLE "clientes_fornecedores" ADD COLUMN IF NOT EXISTS "estado" TEXT;
ALTER TABLE "clientes_fornecedores" ADD COLUMN IF NOT EXISTS "cep" TEXT;
ALTER TABLE "clientes_fornecedores" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
