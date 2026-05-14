import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getErpUser } from "@/lib/auth";
import { sendNewMessageEmail } from "@/lib/mailer";

/* GET — mensagens de uma conversa */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getErpUser(req);
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
  const user = await getErpUser(req);
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      crm: { select: { stage: true } },
      vehicle: { select: { id: true, status: true, brand: true, model: true } },
    },
  });
  if (!conversation) return NextResponse.json({ error: "Conversa não encontrada." }, { status: 404 });
  if (conversation.buyerId !== user.id && conversation.sellerId !== user.id) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  // Se o veículo não existe mais ou foi removido, bloqueia permanentemente
  const vehicle = (conversation as any).vehicle;
  if (!vehicle || vehicle.status === "SOLD" || vehicle.status === "DELETED") {
    return NextResponse.json({
      error: "Este anúncio não está mais disponível. A conversa foi encerrada.",
    }, { status: 403 });
  }

  const stage = (conversation as any).crm?.stage as string | undefined;

  // Se "perdido" e quem envia é o comprador → mover automaticamente para follow-up
  if (stage === "perdido" && conversation.buyerId === user.id) {
    await prisma.leadCrm.upsert({
      where: { conversationId: id },
      create: { conversationId: id, stage: "followup" },
      update: { stage: "followup" },
    });
    // Retorna sinal para o frontend sincronizar, sem bloquear o envio
    // O frontend vai recarregar e retentará o envio na próxima interação
    return NextResponse.json({ movedToFollowup: true }, { status: 403 });
  }

  // Bloqueia apenas "vendido" (negócio fechado — definitivo)
  if (stage === "vendido") {
    return NextResponse.json({ error: "Esta conversa foi encerrada como Vendido e não aceita novas mensagens." }, { status: 403 });
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

    const recipientId = conversation.buyerId === user.id ? conversation.sellerId : conversation.buyerId;
    prisma.user.findUnique({ where: { id: recipientId }, select: { email: true, name: true } })
      .then(recipient => {
        if (!recipient) return;
        return prisma.conversation.findUnique({ where: { id }, include: { vehicle: { select: { brand: true, model: true } } } })
          .then(conv => {
            if (conv?.vehicle) sendNewMessageEmail(recipient.email, recipient.name, user.name, `${conv.vehicle.brand} ${conv.vehicle.model}`).catch(() => null);
          });
      }).catch(() => null);

    return NextResponse.json({ message });
  } catch (err) {
    console.error("[messages POST]", err);
    return NextResponse.json({ error: "Erro ao enviar mensagem." }, { status: 500 });
  }
}
