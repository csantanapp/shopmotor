import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const DAY = 86_400_000;

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function startOfPrevMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() - 1, 1);
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now         = new Date();
  const day0        = startOfDay(now);
  const day7ago     = new Date(day0.getTime() - 6 * DAY);
  const day30ago    = new Date(now.getTime() - 30 * DAY);
  const mesAtual    = startOfMonth(now);
  const mesAnterior = startOfPrevMonth(now);

  // ── Fetch raw data ────────────────────────────────────────────────────────
  const [vehicles, conversations, sales7, sales30, salesMesAtual, salesMesAnterior, vendedores] = await Promise.all([
    prisma.vehicle.findMany({
      where: { userId: user.id },
      include: {
        photos: { take: 1, where: { isCover: true } },
        _count: { select: { conversations: true, favorites: true } },
      },
      orderBy: { views: "desc" },
    }),

    prisma.conversation.findMany({
      where: { sellerId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        vehicle:  { select: { id: true, brand: true, model: true, version: true, yearFab: true, photos: { where: { isCover: true }, take: 1 } } },
        buyer:    { select: { name: true, avatarUrl: true } },
      },
    }),

    prisma.vehicleSale.findMany({
      where: { vehicle: { userId: user.id }, soldAt: { gte: day7ago } },
      select: { soldAt: true, valorVenda: true },
    }),

    prisma.vehicleSale.findMany({
      where: { vehicle: { userId: user.id }, soldAt: { gte: day30ago } },
      select: { soldAt: true, valorVenda: true },
    }),

    prisma.vehicleSale.findMany({
      where: { vehicle: { userId: user.id }, soldAt: { gte: mesAtual } },
      select: { vendedorId: true, valorVenda: true },
    }),

    prisma.vehicleSale.findMany({
      where: { vehicle: { userId: user.id }, soldAt: { gte: mesAnterior, lt: mesAtual } },
      select: { vendedorId: true, valorVenda: true },
    }),

    prisma.vendedor.findMany({
      where: { userId: user.id },
      include: { sales: { select: { soldAt: true, valorVenda: true } } },
    }),
  ]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const activeVehicles     = vehicles.filter(v => v.status === "ACTIVE");
  const openLeads          = conversations.filter(c => { const l = c.messages[0]; return l && l.senderId !== user.id; });
  const hotLeads           = openLeads.filter(c => { const l = c.messages[0]; return l && (now.getTime() - new Date(l.createdAt).getTime()) < DAY; });
  const highChanceVehicles = activeVehicles.filter(v => v.views >= 50);
  const stalePriceVehicles = activeVehicles.filter(v => (now.getTime() - new Date(v.createdAt).getTime()) / DAY >= 21);
  const boostCandidates    = activeVehicles.filter(v => v.views >= 30 && v.boostLevel === "NONE");

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const vendasSemana  = sales7.length;
  const vendasMes     = sales30.length;
  const receitaSemana = sales7.reduce((s, v)  => s + (v.valorVenda ?? 0), 0);
  const receitaMes    = sales30.reduce((s, v) => s + (v.valorVenda ?? 0), 0);
  const previsao      = Math.max(vendasSemana, Math.round(hotLeads.length * 0.35 + boostCandidates.length * 0.15 + vendasSemana));

  // Tempo médio de resposta
  let tempoMedioResp = "—";
  const responseTimes: number[] = [];
  for (const conv of conversations.slice(0, 20)) {
    const last = conv.messages[0];
    if (!last || last.senderId !== user.id) continue;
    const gapMin = (now.getTime() - new Date(last.createdAt).getTime()) / 60_000;
    if (gapMin < 1440) responseTimes.push(gapMin);
  }
  if (responseTimes.length > 0) {
    const avg = responseTimes.reduce((s, v) => s + v, 0) / responseTimes.length;
    tempoMedioResp = avg < 60 ? `${Math.round(avg)} min` : `${(avg / 60).toFixed(1)}h`;
  }

  // ── Tempo médio no estoque ────────────────────────────────────────────────
  const allActive = vehicles.filter(v => v.status === "ACTIVE");
  const diasMap   = allActive.map(v => Math.floor((now.getTime() - new Date(v.createdAt).getTime()) / DAY));
  const tempoMedioEstoque = diasMap.length ? Math.round(diasMap.reduce((a, b) => a + b, 0) / diasMap.length) : 0;

  const faixas = [
    { label: "Até 30 dias",        count: diasMap.filter(d => d <= 30).length },
    { label: "31 a 60 dias",       count: diasMap.filter(d => d > 30 && d <= 60).length },
    { label: "61 a 90 dias",       count: diasMap.filter(d => d > 60 && d <= 90).length },
    { label: "91 a 120 dias",      count: diasMap.filter(d => d > 90 && d <= 120).length },
    { label: "Mais de 120 dias",   count: diasMap.filter(d => d > 120).length },
  ];

  // Carros cadastrados recentemente (últimos 30 dias)
  const recentes = vehicles
    .filter(v => (now.getTime() - new Date(v.createdAt).getTime()) / DAY <= 30)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(v => ({
      id:    v.id,
      name:  `${v.brand} ${v.model}${v.version ? ` ${v.version}` : ""} ${v.yearFab}`,
      dias:  Math.floor((now.getTime() - new Date(v.createdAt).getTime()) / DAY),
      price: v.price,
      cover: v.photos[0]?.url ?? null,
    }));

  // ── Ranking de vendedores ─────────────────────────────────────────────────
  const mesAtualMap    = new Map<string, number>();
  const mesAnteriorMap = new Map<string, number>();
  for (const s of salesMesAtual)    { if (s.vendedorId) mesAtualMap.set(s.vendedorId, (mesAtualMap.get(s.vendedorId) ?? 0) + 1); }
  for (const s of salesMesAnterior) { if (s.vendedorId) mesAnteriorMap.set(s.vendedorId, (mesAnteriorMap.get(s.vendedorId) ?? 0) + 1); }

  const rankingVendedores = vendedores
    .map(v => ({
      id:          v.id,
      nome:        v.nome,
      loja:        v.loja,
      mesAtual:    mesAtualMap.get(v.id) ?? 0,
      mesAnterior: mesAnteriorMap.get(v.id) ?? 0,
      acumulado:   v.sales.length,
    }))
    .sort((a, b) => b.mesAtual - a.mesAtual || b.acumulado - a.acumulado);

  // ── Últimas mensagens recebidas ───────────────────────────────────────────
  const ultimasMensagens = conversations
    .filter(c => { const l = c.messages[0]; return !!l; })
    .sort((a, b) => new Date(b.messages[0]!.createdAt).getTime() - new Date(a.messages[0]!.createdAt).getTime())
    .slice(0, 6)
    .map(c => {
      const msg = c.messages[0]!;
      const waitMs = now.getTime() - new Date(msg.createdAt).getTime();
      const waitMin = Math.floor(waitMs / 60_000);
      const horario = waitMin < 60
        ? `${waitMin} min atrás`
        : waitMin < 1440
          ? `${Math.floor(waitMin / 60)}h atrás`
          : `${Math.floor(waitMin / 1440)}d atrás`;
      const unread = msg.senderId !== user.id;
      const veh = c.vehicle;
      return {
        conversationId: c.id,
        buyerName:  c.buyer.name,
        buyerAvatar: c.buyer.avatarUrl ?? null,
        vehicleName: veh ? `${veh.brand} ${veh.model}${veh.version ? ` ${veh.version}` : ""} ${veh.yearFab}` : "Anúncio removido",
        vehicleId:   veh?.id ?? null,
        vehicleCover: veh?.photos?.[0]?.url ?? null,
        preview:    msg.text.slice(0, 80),
        horario,
        unread,
      };
    });

  // ── Gráficos ──────────────────────────────────────────────────────────────
  const leadsChart: { d: string; leads: number }[] = [];
  const salesChart: { d: string; vendas: number; receita: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(day0.getTime() - i * DAY);
    const dayEnd   = new Date(dayStart.getTime() + DAY);
    const label    = dayStart.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
    leadsChart.push({ d: label, leads: conversations.filter(c => new Date(c.createdAt) >= dayStart && new Date(c.createdAt) < dayEnd).length });
    const ds = sales7.filter(s => new Date(s.soldAt) >= dayStart && new Date(s.soldAt) < dayEnd);
    salesChart.push({ d: label, vendas: ds.length, receita: ds.reduce((s, v) => s + (v.valorVenda ?? 0), 0) });
  }

  const boostLabels: Record<string, string> = { NONE: "Normal", TURBO: "Turbo", DESTAQUE: "Destaque", SUPER_DESTAQUE: "Super" };
  const adsPerf = ["NONE", "TURBO", "DESTAQUE", "SUPER_DESTAQUE"]
    .map(bl => ({ name: boostLabels[bl], v: vehicles.filter(v => v.boostLevel === bl).reduce((s, v) => s + v.views, 0) }))
    .filter(x => x.v > 0);

  const catMap: Record<string, number> = {};
  for (const v of activeVehicles) {
    const cat = v.bodyType ?? v.fuel ?? "Outros";
    catMap[cat] = (catMap[cat] ?? 0) + (v.price ?? 0);
  }
  const potential = Object.entries(catMap).map(([cat, v]) => ({ cat, v: Math.round(v / 1000) })).sort((a, b) => b.v - a.v).slice(0, 6);

  const topVehicles = activeVehicles.slice(0, 4).map(v => ({
    id:       v.id,
    name:     `${v.brand} ${v.model}${v.version ? ` ${v.version}` : ""} ${v.yearFab}`,
    views:    v.views,
    contacts: v._count.conversations,
    favorites: v._count.favorites,
    status:   v.status.toLowerCase(),
    price:    v.price,
    cover:    v.photos[0]?.url ?? null,
  }));

  return NextResponse.json({
    kpis: { hotLeads: hotLeads.length, openLeads: openLeads.length, previsaoVendas: previsao, tempoMedioResp, highChanceVehicles: highChanceVehicles.length, stalePriceVehicles: stalePriceVehicles.length, boostCandidates: boostCandidates.length, activeVehicles: activeVehicles.length, vendasSemana, vendasMes, receitaSemana, receitaMes, totalViews: vehicles.reduce((s, v) => s + v.views, 0), totalFavorites: vehicles.reduce((s, v) => s + v._count.favorites, 0) },
    leadsChart,
    salesChart,
    adsPerf,
    potential,
    topVehicles,
    estoque: { tempoMedio: tempoMedioEstoque, faixas, recentes },
    rankingVendedores,
    ultimasMensagens,
  });
}
