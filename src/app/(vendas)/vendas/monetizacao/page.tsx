"use client";

import { useState } from "react";
import ErpLayout from "@/components/erp/ErpLayout";
import ErpKpiCard from "@/components/erp/ErpKpiCard";
import Icon from "@/components/ui/Icon";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

const GOLD = "#ffd709";
const GOLD2 = "#e6c200";
const BORDER = "rgba(255,255,255,0.08)";
const CARD_BG = "#1a1a1a";
const MUTED = "rgba(255,255,255,0.35)";
const TT = { background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff" };

const revenue = [
  { m: "Jan", v: 84 }, { m: "Fev", v: 96 }, { m: "Mar", v: 110 }, { m: "Abr", v: 128 },
  { m: "Mai", v: 142 }, { m: "Jun", v: 156 }, { m: "Jul", v: 168 }, { m: "Ago", v: 184 },
];
const split = [
  { name: "Assinaturas", value: 48, fill: GOLD },
  { name: "Impulsionamento", value: 22, fill: GOLD2 },
  { name: "Leads financiamento", value: 14, fill: "#3b82f6" },
  { name: "Leads seguro", value: 10, fill: "#22c55e" },
  { name: "Banners", value: 6, fill: "#6b7280" },
];

const plans = [
  { name: "Starter", tagline: "Comece a vender online", price: "R$ 199", features: ["Anúncios básicos", "Visibilidade padrão", "CRM simplificado", "Suporte via e-mail"], cta: "Continuar no Starter", highlight: false },
  { name: "Pro", tagline: "Para lojistas em crescimento", price: "R$ 499", features: ["CRM completo de alta pressão", "Leads qualificados de financiamento", "Score de Venda em todos veículos", "Impulsos com 20% de desconto", "Suporte prioritário"], cta: "Fazer upgrade para Pro", highlight: true },
  { name: "Elite", tagline: "Distribuição preferencial", price: "R$ 1.299", features: ["Prioridade na distribuição de leads", "Inteligência avançada de demanda", "BI dedicado por marca e cidade", "Gerente de conta exclusivo", "API e integrações premium"], cta: "Falar com vendas", highlight: false },
];

export default function MonetizacaoPage() {
  const [toast, setToast] = useState("");
  const fire = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  return (
    <ErpLayout title="Monetização" subtitle="Visão comercial — receita por canal e planos">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#1a1a1a] border border-white/10 px-4 py-3 text-sm text-white shadow-2xl">{toast}</div>
      )}

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <ErpKpiCard label="Faturamento (mês)" value="R$ 184k" delta={9} deltaLabel="vs. mês anterior" icon="payments" accent />
        <ErpKpiCard label="MRR (recorrente)" value="R$ 62k" delta={5} deltaLabel="assinaturas ativas" icon="trending_up" />
        <ErpKpiCard label="Receita impulsos" value="R$ 41k" delta={18} deltaLabel="alta no mês" icon="receipt" />
        <ErpKpiCard label="Lojistas Pro+Elite" value="124" delta={12} deltaLabel="upgrade no mês" icon="workspace_premium" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-[#1a1a1a] p-6">
          <h3 className="font-black text-white mb-1">Receita por mês</h3>
          <p className="text-xs text-white/40 mb-4">em milhares (R$)</p>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                <XAxis dataKey="m" stroke={MUTED} fontSize={12} />
                <YAxis stroke={MUTED} fontSize={12} />
                <Tooltip contentStyle={TT} />
                <Bar dataKey="v" fill={GOLD} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-6">
          <h3 className="font-black text-white mb-1">Receita por canal</h3>
          <p className="text-xs text-white/40 mb-4">% do faturamento</p>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={split} dataKey="value" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {split.map((s) => <Cell key={s.name} fill={s.fill} />)}
                </Pie>
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11, color: MUTED }} />
                <Tooltip contentStyle={TT} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <h3 className="text-xs font-black uppercase tracking-wider text-white/40 mb-4">Planos para lojistas</h3>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((p) => (
          <div key={p.name} className={`rounded-xl border p-6 flex flex-col ${p.highlight ? "border-primary-container/40 bg-primary-container/10" : "border-white/10 bg-[#1a1a1a]"}`}>
            <p className={`text-xs font-black uppercase tracking-wider ${p.highlight ? "text-primary-container" : "text-white/40"}`}>{p.name}</p>
            <p className="mt-1 text-sm text-white/60">{p.tagline}</p>
            <p className="mt-4 text-3xl font-black text-white">{p.price}<span className="text-sm font-normal text-white/40">/mês</span></p>
            <ul className="mt-4 space-y-2 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                  <Icon name="check" className="text-primary-container text-sm" /> {f}
                </li>
              ))}
            </ul>
            <button onClick={() => fire(`Plano ${p.name} selecionado`)} className={`mt-6 w-full rounded-xl py-2.5 text-sm font-black transition ${p.highlight ? "bg-primary-container text-black hover:opacity-90" : "border border-white/10 text-white hover:bg-white/10"}`}>
              {p.cta}
            </button>
          </div>
        ))}
      </div>
    </ErpLayout>
  );
}
