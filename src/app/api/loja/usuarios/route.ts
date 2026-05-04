import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.usuarioLoja.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    include: { grupo: { select: { id: true, nome: true } } },
  });
  return NextResponse.json({ items: items.map(({ senhaHash: _, ...u }) => u) });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { nome, email, senha, grupoId } = await req.json();
  if (!nome || !email || !senha || !grupoId) return NextResponse.json({ error: "Todos os campos são obrigatórios." }, { status: 400 });
  const senhaHash = await bcrypt.hash(senha, 10);
  const item = await prisma.usuarioLoja.create({
    data: { userId: user.id, grupoId, nome, email, senhaHash },
    include: { grupo: { select: { id: true, nome: true } } },
  });
  const { senhaHash: _, ...safe } = item;
  return NextResponse.json({ item: safe });
}
