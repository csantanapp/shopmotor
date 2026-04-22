import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/* GET — mensagens de uma conversa */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;

  try {
    const conversation = await prisma.conversation.findUnique({ where: { id } });
    if (!conversation) return NextResponse.json({ error: "Conversa não encontrada." }, { status: 404 });
    if (conversation.buyerId !== user.id && conversation.sellerId !== user.id) {
      return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
    });

    await prisma.message.updateMany({
      where: { conversationId: id, senderId: { not: user.id }, readAt: null },
      data: { readAt: new Date() },
    });

    return NextResponse.json({ messages });
  } catch (err) {
    console.error("[messages GET]", err);
    return NextResponse.json({ error: "Erro ao buscar mensagens." }, { status: 500 });
  }
}

/* POST — envia mensagem */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const conversation = await prisma.conversation.findUnique({ where: { id } });
  if (!conversation) return NextResponse.json({ error: "Conversa não encontrada." }, { status: 404 });
  if (conversation.buyerId !== user.id && conversation.sellerId !== user.id) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const text = body?.text;
    if (!text?.trim()) return NextResponse.json({ error: "Mensagem vazia." }, { status: 400 });

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: { conversationId: id, senderId: user.id, text: text.trim() },
        include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
      }),
      prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } }),
    ]);

    return NextResponse.json({ message });
  } catch (err) {
    console.error("[messages POST]", err);
    return NextResponse.json({ error: "Erro ao enviar mensagem." }, { status: 500 });
  }
}
