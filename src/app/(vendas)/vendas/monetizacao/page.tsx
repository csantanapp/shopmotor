"use client";

import { useState, useEffect } from "react";
import ErpLayout from "@/components/erp/ErpLayout";
import ErpKpiCard from "@/components/erp/ErpKpiCard";
import Icon from "@/components/ui/Icon";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

const GOLD   = "#ffd709";
const BORDER = "rgba(0,0,0,0.08)";
const MUTED  = "rgba(0,0,0,0.35)";
const TT = { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#111" };

interface MonData {
  faturamentoMes: number;
  mrr: number;
  avgPrice: number;
  avgMonthlySales: number;
  despesasMes: number;
  liquidoMes: number;
  activeSub: { plan: string; amount: number; endsAt: string } | null;
  revenueChart: { m: string; v: number }[];
  canal: { name: string; value: number; fill: string }[];
}



function daysLeft(until: string) {
  return Math.max(0, Math.ceil((new Date(until).getTime() - Date.now()) / 86_400_000));
}

function planColor(plan: string) {
  if (plan === "ELITE") return "text-yellow-700 bg-yellow-50 border-yellow-300";
  if (plan === "PRO")   return "text-blue-700 bg-blue-50 border-blue-300";
  return "text-gray-700 bg-gray-50 border-gray-300";
}

function fmt(n: number) {
  return n.toLocaleString("pt-BR");
}

export default function MonetizacaoPage() {
  const [data, setData]       = useState<MonData | null>(null);
  const [sub, setSub]         = useState<{ plan: string; amount: number; endsAt: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState("");

  const fire = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    Promise.all([
      fetch("/api/perfil/monetizacao").then(r => r.json()),
      fetch("/api/payments/subscription").then(r => r.json()),
    ]).then(([mon, payment]) => {
      setData(mon);
      setSub(payment.subscription ?? null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const left = sub?.endsAt ? daysLeft(sub.endsAt) : null;

  return (
    <ErpLayout title="Monetização" subtitle="Visão comercial — receita por canal e planos">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-2xl">{toast}</div>
      )}

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <ErpKpiCard
          label="Faturamento (mês)"
          value={loading ? "—" : `${data?.faturamentoMes ?? 0} vendas`}
          icon="payments"
          accent={!loading && (data?.faturamentoMes ?? 0) > 0}
        />
        <ErpKpiCard
          label="MRR (recorrente)"
          value={loading ? "—" : `R$ ${fmt(data?.mrr ?? 0)}`}
          deltaLabel={loading ? "" : `Ticket médio R$ ${fmt(data?.avgPrice ?? 0)}`}
          icon="trending_up"
        />
        <ErpKpiCard
          label="Despesas (Mês)"
          value={loading ? "—" : `R$ ${fmt(data?.despesasMes ?? 0)}`}
          deltaLabel={sub ? `Plano ${sub.plan}` : "Sem plano ativo"}
          icon="receipt"
        />
        <ErpKpiCard
          label="Líquido mês"
          value={loading ? "—" : `R$ ${fmt(data?.liquidoMes ?? 0)}`}
          icon="account_balance"
          accent={!loading && (data?.liquidoMes ?? 0) > 0}
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2 rounded-xl border border-black/10 bg-white p-6 shadow-sm">
          <h3 className="font-black text-gray-900 mb-1">Receita por mês</h3>
          <p className="text-xs text-gray-400 mb-4">Pagamentos de assinaturas (R$)</p>
          <div className="h-72">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <span className="h-8 w-8 rounded-full border-2 border-primary-container/30 border-t-primary-container animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={data?.revenueChart ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                  <XAxis dataKey="m" stroke={MUTED} fontSize={12} />
                  <YAxis stroke={MUTED} fontSize={12} tickFormatter={v => `R$${v}`} />
                  <Tooltip contentStyle={TT} formatter={(v: unknown) => [`R$ ${fmt(v as number)}`, "Receita"]} />
                  <Bar dataKey="v" fill={GOLD} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
          <h3 className="font-black text-gray-900 mb-1">Receita por canal</h3>
          <p className="text-xs text-gray-400 mb-4">% do faturamento</p>
          <div className="h-72">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <span className="h-8 w-8 rounded-full border-2 border-primary-container/30 border-t-primary-container animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={data?.canal ?? []} dataKey="value" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {(data?.canal ?? []).map((s) => <Cell key={s.name} fill={s.fill} />)}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11, color: MUTED }} />
                  <Tooltip contentStyle={TT} formatter={(v: unknown) => [`${v}%`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Plano atual */}
      {!loading && sub && (
        <div className={`rounded-xl border p-5 mb-8 flex items-center gap-4 ${planColor(sub.plan)}`}>
          <Icon name="workspace_premium" className="text-2xl shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-black text-base">Plano {sub.plan} ativo</p>
            <p className="text-sm mt-0.5 opacity-70">
              Válido até {new Date(sub.endsAt).toLocaleDateString("pt-BR")} · {left} dias restantes
            </p>
          </div>
          {left !== null && left <= 7 && (
            <span className="shrink-0 rounded-full bg-red-100 text-red-700 border border-red-300 px-3 py-1 text-xs font-black">Renovar em breve</span>
          )}
        </div>
      )}

      {!loading && !sub && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 mb-8 flex items-start gap-3">
          <Icon name="info" className="text-yellow-600 text-xl shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-yellow-900">Você está no Plano Grátis</p>
            <p className="text-sm text-yellow-700 mt-1">Assine um plano pago para desbloquear mais anúncios, leads qualificados e recursos avançados.</p>
          </div>
        </div>
      )}

    </ErpLayout>
  );
}
