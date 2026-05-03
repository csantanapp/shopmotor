import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.clienteFornecedor.findMany({
    where: { userId: user.id },
    orderBy: { nome: "asc" },
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { tipo, nome, documento } = await req.json();
  if (!nome || !documento) return NextResponse.json({ error: "Nome e documento são obrigatórios." }, { status: 400 });
  const item = await prisma.clienteFornecedor.create({
    data: { userId: user.id, tipo: tipo ?? "PF", nome, documento },
  });
  return NextResponse.json({ item });
}
