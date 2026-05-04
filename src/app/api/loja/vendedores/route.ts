import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.vendedor.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { nome, loja } = await req.json();
  if (!nome || !loja) return NextResponse.json({ error: "Nome e loja são obrigatórios." }, { status: 400 });
  const item = await prisma.vendedor.create({ data: { userId: user.id, nome, loja } });
  return NextResponse.json({ item });
}
