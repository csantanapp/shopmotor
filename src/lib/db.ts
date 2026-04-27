// Wrapper tipado do Prisma — use `db` no lugar de `prisma as any`
// Todos os modelos abaixo existem no schema.prisma e são gerados pelo Prisma client.
import { prisma } from "./prisma";
import type { PrismaClient } from "@prisma/client";

export const db = prisma as PrismaClient;

export {
  db as default,
  prisma,
};
