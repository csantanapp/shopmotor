CREATE TABLE "vendedores" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "loja" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "vendedores_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "grupos_permissao" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "modulos" TEXT NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "grupos_permissao_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "usuarios_loja" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "grupoId" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "senhaHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "usuarios_loja_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "vendedores_userId_idx" ON "vendedores"("userId");
CREATE INDEX "grupos_permissao_userId_idx" ON "grupos_permissao"("userId");
CREATE INDEX "usuarios_loja_userId_idx" ON "usuarios_loja"("userId");

ALTER TABLE "vendedores" ADD CONSTRAINT "vendedores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "grupos_permissao" ADD CONSTRAINT "grupos_permissao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "usuarios_loja" ADD CONSTRAINT "usuarios_loja_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "usuarios_loja" ADD CONSTRAINT "usuarios_loja_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos_permissao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
