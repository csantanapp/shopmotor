import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getErpUser } from "@/lib/auth";

export async function GET() {
  const user = await getErpUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.grupoPermissao.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });
  return NextResponse.json({ items: items.map(g => ({ ...g, modulos: JSON.parse(g.modulos) })) });
}

export async function POST(req: NextRequest) {
  const user = await getErpUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { nome, modulos } = await req.json();
  if (!nome) return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
  const item = await prisma.grupoPermissao.create({
    data: { userId: user.id, nome, modulos: JSON.stringify(modulos ?? {}) },
  });
  return NextResponse.json({ item: { ...item, modulos: JSON.parse(item.modulos) } });
}
