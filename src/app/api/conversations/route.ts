import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Retorna o plano ativo de um userId lojista (null se sem plano ativo)
async function getActivePlan(userId: string): Promise<"STARTER" | "PRO" | "ELITE" | null> {
  const sub = await prisma.storeSubscription.findFirst({
    where: { userId, status: "active", endsAt: { gt: new Date() } },
    select: { plan: true },
  });
  return sub?.plan ?? null;
}

// Mascara email/phone para quem não tem plano PRO ou ELITE
function maskContact(user: { id: string; name: string; avatarUrl: string | null; email: string; phone: string | null; sharePhone: boolean }, canSeeContact: boolean) {
  if (canSeeContact) return user;
  return { ...user, email: null, phone: null, sharePhone: false };
}

/* GET — lista conversas do usuário logado */
export async function GET() {
  try {
    const user = await getCurrentUser() as any;
    if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

    const conversations = await prisma.conversation.findMany({
      where: { OR: [{ buyerId: user.id }, { sellerId: user.id }] },
      orderBy: { updatedAt: "desc" },
      include: {
        vehicle: { select: { id: true, brand: true, model: true, photos: { where: { isCover: true }, take: 1 } } },
        buyer:   { select: { id: true, name: true, avatarUrl: true, email: true, phone: true, sharePhone: true } },
        seller:  { select: { id: true, name: true, avatarUrl: true, email: true, phone: true, sharePhone: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    // Determina se o usuário logado (quando é vendedor/lojista PJ) pode ver contatos
    // PRO e ELITE podem ver — STARTER e PF não
    let canSeeContact = false;
    if (user.accountType === "PJ") {
      const plan = await getActivePlan(user.id);
      canSeeContact = plan === "PRO" || plan === "ELITE";
    }

    // Aplica máscara: vendedor vê contato do comprador conforme plano
    // Comprador sempre vê contato do vendedor normalmente
    const masked = conversations.map(conv => {
      const isSeller = conv.sellerId === user.id;
      return {
        ...conv,
        // Vendedor: mascara buyer se não tem plano habilitado
        // Comprador: vê seller sem restrição
        buyer:  isSeller ? maskContact(conv.buyer as any, canSeeContact) : conv.buyer,
        seller: conv.seller,
        // Expõe o plano do vendedor para o frontend saber se deve exibir badge
        sellerPlan: isSeller ? (canSeeContact ? "PRO_OR_ELITE" : "STARTER") : null,
      };
    });

    return NextResponse.json({ conversations: masked, canSeeContact, currentUserId: user.id });
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
