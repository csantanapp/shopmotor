import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const DAY = 86_400_000;

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now      = new Date();
  const day0     = startOfDay(now);
  const day7ago  = new Date(day0.getTime() - 6 * DAY);
  const day30ago = new Date(now.getTime() - 30 * DAY);

  // ── Fetch raw data ────────────────────────────────────────────────────────
  const [vehicles, conversations, sales7, sales30] = await Promise.all([
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
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        vehicle:  { select: { brand: true, model: true, version: true, yearFab: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),

    prisma.vehicleSale.findMany({
      where: { vehicle: { userId: user.id }, soldAt: { gte: day7ago } },
      select: { soldAt: true, valorVenda: true },
    }),

    prisma.vehicleSale.findMany({
      where: { vehicle: { userId: user.id }, soldAt: { gte: day30ago } },
      select: { soldAt: true, valorVenda: true },
    }),
  ]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const activeVehicles = vehicles.filter(v => v.status === "ACTIVE");
  const openLeads      = conversations.filter(c => {
    const last = c.messages[0];
    return last && last.senderId !== user.id;
  });

  // Leads sem resposta nas últimas 24h (quentes)
  const hotLeads = openLeads.filter(c => {
    const last = c.messages[0];
    return last && (now.getTime() - new Date(last.createdAt).getTime()) < DAY;
  });

  // Veículos com score alto (views >= 50)
  const highChanceVehicles = activeVehicles.filter(v => v.views >= 50);

  // Precisam ajuste de preço (ativos há 21+ dias)
  const stalePriceVehicles = activeVehicles.filter(v => {
    const daysActive = (now.getTime() - new Date(v.createdAt).getTime()) / DAY;
    return daysActive >= 21;
  });

  // Para impulsionar (muitas views, sem boost)
  const boostCandidates = activeVehicles.filter(v => v.views >= 30 && v.boostLevel === "NONE");

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const vendasSemana  = sales7.length;
  const vendasMes     = sales30.length;
  const receitaSemana = sales7.reduce((s, v) => s + (v.valorVenda ?? 0), 0);
  const receitaMes    = sales30.reduce((s, v) => s + (v.valorVenda ?? 0), 0);

  // Previsão de vendas: média semanal * ajuste por leads quentes
  const previsao = Math.max(
    vendasSemana,
    Math.round(hotLeads.length * 0.35 + boostCandidates.length * 0.15 + vendasSemana),
  );

  // Tempo médio de resposta estimado (baseado em gaps das conversas)
  let tempoMedioResp = "—";
  const responseTimes: number[] = [];
  for (const conv of conversations.slice(0, 20)) {
    const last = conv.messages[0];
    if (!last || last.senderId !== user.id) continue;
    const gapMin = (now.getTime() - new Date(last.createdAt).getTime()) / 60_000;
    if (gapMin < 1440) responseTimes.push(gapMin); // só considera últimas 24h
  }
  if (responseTimes.length > 0) {
    const avg = responseTimes.reduce((s, v) => s + v, 0) / responseTimes.length;
    tempoMedioResp = avg < 60 ? `${Math.round(avg)} min` : `${(avg / 60).toFixed(1)}h`;
  }

  // ── Conversas por dia (últimos 7 dias) ───────────────────────────────────
  const leadsChart: { d: string; leads: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(day0.getTime() - i * DAY);
    const dayEnd   = new Date(dayStart.getTime() + DAY);
    const count    = conversations.filter(c =>
      new Date(c.createdAt) >= dayStart && new Date(c.createdAt) < dayEnd,
    ).length;
    leadsChart.push({
      d: dayStart.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
      leads: count,
    });
  }

  // ── Vendas por dia (últimos 7 dias) ──────────────────────────────────────
  const salesChart: { d: string; vendas: number; receita: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(day0.getTime() - i * DAY);
    const dayEnd   = new Date(dayStart.getTime() + DAY);
    const daySales = sales7.filter(s => new Date(s.soldAt) >= dayStart && new Date(s.soldAt) < dayEnd);
    salesChart.push({
      d:       dayStart.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
      vendas:  daySales.length,
      receita: daySales.reduce((s, v) => s + (v.valorVenda ?? 0), 0),
    });
  }

  // ── Performance por boost level ──────────────────────────────────────────
  const boostGroups = ["NONE", "TURBO", "DESTAQUE", "SUPER_DESTAQUE"];
  const boostLabels: Record<string, string> = { NONE: "Normal", TURBO: "Turbo", DESTAQUE: "Destaque", SUPER_DESTAQUE: "Super" };
  const adsPerf = boostGroups.map(bl => ({
    name: boostLabels[bl],
    v:    vehicles.filter(v => v.boostLevel === bl).reduce((s, v) => s + v.views, 0),
  })).filter(x => x.v > 0);

  // ── Receita potencial por categoria (tipo de veículo) ─────────────────────
  const catMap: Record<string, number> = {};
  for (const v of activeVehicles) {
    const cat = v.bodyType ?? v.fuel ?? "Outros";
    catMap[cat] = (catMap[cat] ?? 0) + (v.price ?? 0);
  }
  const potential = Object.entries(catMap)
    .map(([cat, v]) => ({ cat, v: Math.round(v / 1000) }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 6);

  // ── Top veículos mais visualizados ────────────────────────────────────────
  const topVehicles = vehicles
    .filter(v => v.status === "ACTIVE")
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map(v => ({
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
    kpis: {
      hotLeads:            hotLeads.length,
      openLeads:           openLeads.length,
      previsaoVendas:      previsao,
      tempoMedioResp,
      highChanceVehicles:  highChanceVehicles.length,
      stalePriceVehicles:  stalePriceVehicles.length,
      boostCandidates:     boostCandidates.length,
      activeVehicles:      activeVehicles.length,
      vendasSemana,
      vendasMes,
      receitaSemana,
      receitaMes,
      totalViews:          vehicles.reduce((s, v) => s + v.views, 0),
      totalFavorites:      vehicles.reduce((s, v) => s + v._count.favorites, 0),
    },
    leadsChart,
    salesChart,
    adsPerf,
    potential,
    topVehicles,
  });
}
