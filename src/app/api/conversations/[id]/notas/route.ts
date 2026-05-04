import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const conv = await prisma.conversation.findFirst({ where: { id: params.id, sellerId: user.id } });
    if (!conv) return NextResponse.json({ notas: [] });

    const notas = await prisma.leadNota.findMany({
      where: { conversationId: params.id },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ notas });
  } catch {
    return NextResponse.json({ notas: [] });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const conv = await prisma.conversation.findFirst({ where: { id: params.id, sellerId: user.id } });
    if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { texto } = await req.json();
    if (!texto?.trim()) return NextResponse.json({ error: "texto obrigatório" }, { status: 400 });

    const nota = await prisma.leadNota.create({
      data: { conversationId: params.id, texto: texto.trim(), autorNome: user.name ?? "Vendedor" },
    });
    return NextResponse.json({ nota });
  } catch {
    return NextResponse.json({ error: "Erro ao salvar nota" }, { status: 500 });
  }
}
