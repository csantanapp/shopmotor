import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000);
  const sevenDaysAgo  = new Date(now.getTime() -  7 * 86_400_000);

  const [vehicles, conversations, vehicleSales] = await Promise.all([
    prisma.vehicle.findMany({
      where: { userId: user.id, status: { in: ["ACTIVE", "DRAFT", "PAUSED"] } },
      orderBy: { views: "desc" },
      include: {
        photos: { where: { isCover: true }, take: 1 },
        _count: { select: { favorites: true, conversations: true } },
      },
    }),

    prisma.conversation.findMany({
      where: { sellerId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        vehicle: { select: { id: true, brand: true, model: true, version: true, yearFab: true } },
        buyer:   { select: { name: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),

    prisma.vehicleSale.findMany({
      where: { vehicle: { userId: user.id }, soldAt: { gte: thirtyDaysAgo } },
      select: { valorVenda: true, soldAt: true },
    }),
  ]);

  // ── Stats resumo ──────────────────────────────────────────────────────────
  const activeVehicles  = vehicles.filter(v => v.status === "ACTIVE");
  const totalViews      = vehicles.reduce((s, v) => s + v.views, 0);
  const totalFavorites  = vehicles.reduce((s, v) => s + v._count.favorites, 0);
  const vendasMes       = vehicleSales.length;
  const receitaMes      = vehicleSales.reduce((s, v) => s + (v.valorVenda ?? 0), 0);

  // ── Oportunidades geradas dinamicamente ───────────────────────────────────
  const opportunities: {
    id: string; type: string; priority: "alta" | "media" | "baixa";
    impact: string; vehicle?: string; vehicleId?: string;
    lead?: string; conversationId?: string;
    waitingTime?: string; recommendation: string; icon: string;
  }[] = [];

  // 1. Conversas sem resposta do vendedor (última mensagem é do comprador)
  for (const conv of conversations) {
    const lastMsg = conv.messages[0];
    if (!lastMsg) continue;
    if (lastMsg.senderId === user.id) continue; // já respondeu

    const waitMs    = now.getTime() - new Date(lastMsg.createdAt).getTime();
    const waitMins  = Math.floor(waitMs / 60_000);
    const waitLabel = waitMins < 60
      ? `${waitMins} min sem resposta`
      : `${Math.floor(waitMins / 60)}h sem resposta`;

    const vLabel = conv.vehicle
      ? `${conv.vehicle.brand} ${conv.vehicle.model}${conv.vehicle.version ? ` ${conv.vehicle.version}` : ""} ${conv.vehicle.yearFab}`
      : undefined;

    opportunities.push({
      id:             `conv-${conv.id}`,
      type:           "Lead aguardando resposta",
      priority:       waitMins < 30 ? "alta" : waitMins < 120 ? "media" : "alta",
      impact:         waitMins < 30 ? "+45% chance de conversão" : "+20% chance se responder agora",
      vehicle:        vLabel,
      vehicleId:      conv.vehicle?.id,
      lead:           conv.buyer.name,
      conversationId: conv.id,
      waitingTime:    waitLabel,
      recommendation: waitMins < 30
        ? "Responda agora — lead quente"
        : "Retome o contato com urgência",
      icon: "chat",
    });
  }

  // 2. Veículos com alto volume de visitas e sem impulso ativo
  for (const v of vehicles) {
    if (v.boostLevel !== "NONE") continue;
    if (v.views < 30) continue;

    const label = `${v.brand} ${v.model}${v.version ? ` ${v.version}` : ""} ${v.yearFab}`;
    opportunities.push({
      id:             `boost-${v.id}`,
      type:           `${v.views.toLocaleString("pt-BR")} visualizações sem impulso`,
      priority:       v.views >= 100 ? "alta" : "media",
      impact:         "Momento ideal para ampliar alcance",
      vehicle:        label,
      vehicleId:      v.id,
      waitingTime:    `${v.views} views acumuladas`,
      recommendation: "Ativar impulsionamento agora para converter o interesse",
      icon:           "rocket_launch",
    });
  }

  // 3. Veículos sem venda há muito tempo (ativos há mais de 21 dias)
  for (const v of vehicles) {
    if (v.status !== "ACTIVE") continue;
    const diasAtivo = Math.floor((now.getTime() - new Date(v.createdAt).getTime()) / 86_400_000);
    if (diasAtivo < 21) continue;

    const label = `${v.brand} ${v.model}${v.version ? ` ${v.version}` : ""} ${v.yearFab}`;
    opportunities.push({
      id:             `stale-${v.id}`,
      type:           `Veículo há ${diasAtivo} dias no estoque`,
      priority:       diasAtivo >= 45 ? "alta" : "media",
      impact:         "Redução de preço pode gerar contatos em 48h",
      vehicle:        label,
      vehicleId:      v.id,
      waitingTime:    `${diasAtivo} dias sem venda`,
      recommendation: `Considere ajustar o preço em −3% a −5%`,
      icon:           "trending_down",
    });
  }

  // 4. Veículos com poucas fotos (< 5)
  for (const v of vehicles) {
    if (v.status !== "ACTIVE") continue;
    const photoCount = await prisma.vehiclePhoto.count({ where: { vehicleId: v.id } });
    if (photoCount >= 5) continue;

    const label = `${v.brand} ${v.model}${v.version ? ` ${v.version}` : ""} ${v.yearFab}`;
    opportunities.push({
      id:             `photos-${v.id}`,
      type:           `Anúncio com apenas ${photoCount} foto${photoCount !== 1 ? "s" : ""}`,
      priority:       "baixa",
      impact:         "Mais fotos aumentam cliques em até 2×",
      vehicle:        label,
      vehicleId:      v.id,
      recommendation: `Adicione ${5 - photoCount} fotos para completar o anúncio`,
      icon:           "photo_camera",
    });
  }

  // 5. Veículos em rascunho
  const drafts = vehicles.filter(v => v.status === "DRAFT");
  for (const v of drafts) {
    const label = `${v.brand} ${v.model}${v.version ? ` ${v.version}` : ""} ${v.yearFab}`;
    opportunities.push({
      id:        `draft-${v.id}`,
      type:      "Veículo em rascunho — não está aparecendo nas buscas",
      priority:  "media",
      impact:    "Publicar gera visibilidade imediata",
      vehicle:   label,
      vehicleId: v.id,
      recommendation: "Publicar o anúncio para começar a receber leads",
      icon: "publish",
    });
  }

  // Ordena: alta → media → baixa, depois por impacto numérico
  const order = { alta: 0, media: 1, baixa: 2 };
  opportunities.sort((a, b) => order[a.priority] - order[b.priority]);

  return NextResponse.json({
    stats: {
      activeVehicles: activeVehicles.length,
      totalVehicles:  vehicles.length,
      totalViews,
      totalFavorites,
      openConversations: conversations.filter(c => {
        const last = c.messages[0];
        return last && last.senderId !== user.id;
      }).length,
      vendasMes,
      receitaMes,
      vendasSemana: vehicleSales.filter(s => new Date(s.soldAt) >= sevenDaysAgo).length,
    },
    opportunities: opportunities.slice(0, 12),
  });
}
