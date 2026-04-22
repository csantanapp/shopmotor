import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/* GET — lista conversas do usuário logado */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

    const conversations = await prisma.conversation.findMany({
      where: { OR: [{ buyerId: user.id }, { sellerId: user.id }] },
      orderBy: { updatedAt: "desc" },
      include: {
        vehicle: { select: { id: true, brand: true, model: true, photos: { where: { isCover: true }, take: 1 } } },
        buyer:  { select: { id: true, name: true, avatarUrl: true, email: true, phone: true, sharePhone: true } },
        seller: { select: { id: true, name: true, avatarUrl: true, email: true, phone: true, sharePhone: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    return NextResponse.json({ conversations });
  } catch (err) {
    console.error("[GET /api/conversations]", err);
    return NextResponse.json({ error: "Erro interno.", detail: String(err) }, { status: 500 });
  }
}

/* POST — cria ou recupera conversa e envia primeira mensagem */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { vehicleId, text } = await req.json();
  if (!vehicleId || !text) return NextResponse.json({ error: "vehicleId e text obrigatórios." }, { status: 400 });

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId }, select: { userId: true } });
  if (!vehicle) return NextResponse.json({ error: "Veículo não encontrado." }, { status: 404 });

  if (vehicle.userId === user.id) return NextResponse.json({ error: "Você não pode enviar proposta para seu próprio anúncio." }, { status: 400 });

  // Cria ou reutiliza conversa existente
  const conversation = await prisma.conversation.upsert({
    where: { vehicleId_buyerId: { vehicleId, buyerId: user.id } },
    create: { vehicleId, buyerId: user.id, sellerId: vehicle.userId },
    update: { updatedAt: new Date() },
  });

  const message = await prisma.message.create({
    data: { conversationId: conversation.id, senderId: user.id, text },
  });

  return NextResponse.json({ conversation, message });
}
