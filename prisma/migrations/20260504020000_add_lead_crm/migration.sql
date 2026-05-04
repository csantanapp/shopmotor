CREATE TABLE "lead_crm" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "stage" TEXT NOT NULL DEFAULT 'novo',
  "tags" TEXT NOT NULL DEFAULT '[]',
  "valorProposta" INTEGER,
  "interesse" TEXT,
  "motivoPerda" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "lead_crm_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "lead_crm_conversationId_key" ON "lead_crm"("conversationId");
ALTER TABLE "lead_crm" ADD CONSTRAINT "lead_crm_conversationId_fkey"
  FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "lead_notas" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "texto" TEXT NOT NULL,
  "autorNome" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lead_notas_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "lead_notas_conversationId_createdAt_idx" ON "lead_notas"("conversationId", "createdAt");
ALTER TABLE "lead_notas" ADD CONSTRAINT "lead_notas_conversationId_fkey"
  FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
