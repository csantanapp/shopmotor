-- AlterColumn: convert notas from TEXT to JSONB, preserving existing data
ALTER TABLE "financiamento_leads"
  ALTER COLUMN "notas" DROP DEFAULT,
  ALTER COLUMN "notas" TYPE JSONB USING notas::jsonb,
  ALTER COLUMN "notas" SET DEFAULT '[]'::jsonb;
