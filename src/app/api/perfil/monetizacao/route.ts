import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now    = new Date();
  const startM = new Date(now.getFullYear(), now.getMonth(), 1);
  const startY = new Date(now.getFullYear(), 0, 1);

  // Vehicles sold (all time and this month)
  const [soldAll, soldMonth] = await Promise.all([
    prisma.vehicle.findMany({
      where: { userId: user.id, status: "SOLD" },
      select: { price: true, updatedAt: true },
    }),
    prisma.vehicle.count({
      where: { userId: user.id, status: "SOLD", updatedAt: { gte: startM } },
    }),
  ]);

  // Ticket médio
  const avgPrice = soldAll.length > 0
    ? Math.round(soldAll.reduce((s, v) => s + v.price, 0) / soldAll.length)
    : 0;

  // Vendas por mês (últimos 8 meses) para calcular média mensal
  const months8 = new Date(now.getFullYear(), now.getMonth() - 7, 1);
  const soldByMonth: Record<string, number> = {};
  soldAll
    .filter(v => v.updatedAt >= months8)
    .forEach(v => {
      const key = `${v.updatedAt.getFullYear()}-${String(v.updatedAt.getMonth() + 1).padStart(2, "0")}`;
      soldByMonth[key] = (soldByMonth[key] ?? 0) + 1;
    });

  // Média mensal de vendas (sobre os últimos 8 meses)
  const avgMonthlySales = Object.keys(soldByMonth).length > 0
    ? Math.round(Object.values(soldByMonth).reduce((s, n) => s + n, 0) / 8)
    : 0;

  const mrr = avgPrice * avgMonthlySales;

  // Assinatura ativa
  const activeSub = await prisma.storeSubscription.findFirst({
    where: { userId: user.id, status: "active", endsAt: { gt: now } },
    select: { plan: true, amount: true, endsAt: true },
  });

  // Despesas do mês: assinatura ativa (pró-rata ≈ valor mensal) + boosts (sem histórico, usa 0)
  const despesasMes = activeSub?.amount ?? 0;

  // Líquido do mês
  const liquidoMes = soldMonth * avgPrice - despesasMes;

  // Histórico de assinaturas por mês (últimos 8 meses) — para gráfico "Receita por mês"
  const subs8 = await prisma.storeSubscription.findMany({
    where: { userId: user.id, createdAt: { gte: months8 } },
    select: { amount: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Monta série temporal dos últimos 8 meses
  const labels: string[] = [];
  const revenueByMonth: Record<string, number> = {};
  for (let i = 7; i >= 0; i--) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const lbl = d.toLocaleString("pt-BR", { month: "short" });
    labels.push(lbl);
    revenueByMonth[key] = 0;
  }
  subs8.forEach(s => {
    const key = `${s.createdAt.getFullYear()}-${String(s.createdAt.getMonth() + 1).padStart(2, "0")}`;
    if (key in revenueByMonth) revenueByMonth[key] += s.amount;
  });

  const revenueChart = Object.entries(revenueByMonth).map(([, v], i) => ({
    m: labels[i],
    v: Math.round(v),
  }));

  // Canal split: assinatura vs boost (sem histórico de boost, só assinatura)
  const totalSubsYear = await prisma.storeSubscription.aggregate({
    where: { userId: user.id, createdAt: { gte: startY } },
    _sum: { amount: true },
  });
  const totalSubs = totalSubsYear._sum.amount ?? 0;

  const canal = totalSubs > 0
    ? [
        { name: "Assinatura", value: 100, fill: "#ffd709" },
      ]
    : [
        { name: "Sem dados", value: 100, fill: "#e5e7eb" },
      ];

  return NextResponse.json({
    faturamentoMes: soldMonth,
    mrr,
    avgPrice,
    avgMonthlySales,
    despesasMes,
    liquidoMes,
    activeSub,
    revenueChart,
    canal,
  });
}
