import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const pagina = req.nextUrl.searchParams.get("pagina") ?? "faq";
  const db = prisma;

  const items = await db.faqItem.findMany({
    where: { ativo: true, OR: [{ pagina }, { pagina: "ambas" }] },
    orderBy: [{ categoria: "asc" }, { ordem: "asc" }, { createdAt: "asc" }],
  });

  // Agrupar por categoria
  const grouped: Record<string, { pergunta: string; resposta: string }[]> = {};
  for (const item of items) {
    if (!grouped[item.categoria]) grouped[item.categoria] = [];
    grouped[item.categoria].push({ pergunta: item.pergunta, resposta: item.resposta });
  }

  return NextResponse.json({ items, grouped });
}
