"use client";

import ErpLayout from "@/components/erp/ErpLayout";
import ErpKpiCard from "@/components/erp/ErpKpiCard";
import ErpStatusBadge from "@/components/erp/ErpStatusBadge";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, LineChart, Line,
} from "recharts";

const GOLD = "#ffd709";
const GOLD2 = "#e6c200";
const BORDER = "rgba(255,255,255,0.08)";
const CARD_BG = "#1a1a1a";
const MUTED = "rgba(255,255,255,0.35)";
const TT = { background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 8, color: "#fff" };

const leadsData = [
  { d: "Seg", leads: 24 }, { d: "Ter", leads: 31 }, { d: "Qua", leads: 28 },
  { d: "Qui", leads: 42 }, { d: "Sex", leads: 51 }, { d: "Sáb", leads: 67 }, { d: "Dom", leads: 45 },
];
const conversion = [
  { source: "Site", v: 38 }, { source: "Financiamento", v: 52 },
  { source: "Seguro", v: 31 }, { source: "Indicação", v: 64 },
];
const adsPerf = [
  { name: "Normal", v: 1240 }, { name: "Turbo", v: 3210 },
  { name: "Destaque", v: 5430 }, { name: "Super", v: 8900 },
];
const potential = [
  { cat: "SUV", v: 480 }, { cat: "Sedan", v: 320 },
  { cat: "Hatch", v: 210 }, { cat: "Pickup", v: 380 }, { cat: "Moto", v: 140 },
];

export default function DirecaoPage() {
  return (
    <ErpLayout title="Dashboard de Direção" subtitle="Sua semana de vendas em uma tela">
      <section className="rounded-2xl border border-primary-container/30 bg-[#1a1500] p-6 md:p-8 mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-container/15 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-primary-container">
          Previsão de vendas
        </span>
        <h2 className="mt-3 text-3xl md:text-4xl font-black text-white tracking-tight">
          Você pode vender <span className="text-primary-container">7 veículos</span> esta semana
        </h2>
        <p className="mt-2 text-sm text-white/60">
          Combinando leads quentes, anúncios em alta e ajustes de preço sugeridos.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[
            { n: "3", t: "Leads prontos para fechamento", c: "text-green-400" },
            { n: "2", t: "Veículos precisam ajuste de preço", c: "text-primary-container" },
            { n: "2", t: "Anúncios para impulsionar", c: "text-blue-400" },
            { n: "5", t: "Leads precisam resposta rápida", c: "text-red-400" },
          ].map((b) => (
            <div key={b.t} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className={`text-3xl font-black ${b.c}`}>{b.n}</p>
              <p className="mt-1 text-xs text-white/60">{b.t}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5 mb-6">
        <ErpKpiCard label="Leads quentes" value="14" delta={28} deltaLabel="vs. semana" icon="local_fire_department" accent />
        <ErpKpiCard label="Vendas previstas" value="7" delta={17} deltaLabel="esta semana" icon="target" />
        <ErpKpiCard label="Tempo médio resp." value="6 min" delta={-22} deltaLabel="melhorou" icon="timer" />
        <ErpKpiCard label="Veículos alta chance" value="11" delta={9} deltaLabel="score 80+" icon="directions_car" />
        <ErpKpiCard label="Receita potencial" value="R$ 1,4M" delta={12} deltaLabel="próx. 7 dias" icon="payments" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-[#1a1a1a] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-white">Leads por dia</h3>
              <p className="text-xs text-white/40">Últimos 7 dias</p>
            </div>
            <span className="text-xs font-bold text-green-400">+18% semana</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={leadsData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={GOLD} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                <XAxis dataKey="d" stroke={MUTED} fontSize={12} />
                <YAxis stroke={MUTED} fontSize={12} />
                <Tooltip contentStyle={TT} />
                <Area type="monotone" dataKey="leads" stroke={GOLD2} strokeWidth={2.5} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-6">
          <h3 className="font-black text-white">Conversão por origem</h3>
          <p className="text-xs text-white/40 mb-4">% leads → venda</p>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={conversion} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} horizontal={false} />
                <XAxis type="number" stroke={MUTED} fontSize={11} />
                <YAxis type="category" dataKey="source" stroke={MUTED} fontSize={11} width={100} />
                <Tooltip contentStyle={TT} />
                <Bar dataKey="v" fill={GOLD} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-6">
          <h3 className="font-black text-white">Performance dos anúncios</h3>
          <p className="text-xs text-white/40 mb-4">Visualizações por tipo de plano</p>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={adsPerf}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                <XAxis dataKey="name" stroke={MUTED} fontSize={11} />
                <YAxis stroke={MUTED} fontSize={11} />
                <Tooltip contentStyle={TT} />
                <Bar dataKey="v" fill={GOLD} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-6">
          <h3 className="font-black text-white">Receita potencial por categoria</h3>
          <p className="text-xs text-white/40 mb-4">em milhares (R$)</p>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={potential}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                <XAxis dataKey="cat" stroke={MUTED} fontSize={11} />
                <YAxis stroke={MUTED} fontSize={11} />
                <Tooltip contentStyle={TT} />
                <Line type="monotone" dataKey="v" stroke={GOLD2} strokeWidth={3} dot={{ r: 5, fill: GOLD }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-white">Veículos mais visualizados</h3>
            <p className="text-xs text-white/40">Aproveite o pico de interesse</p>
          </div>
          <span className="text-xs font-bold text-primary-container bg-primary-container/15 px-2 py-1 rounded-md uppercase tracking-wider">Hot</span>
        </div>
        <ul className="divide-y divide-white/5">
          {[
            { name: "Toyota Corolla XEi 2023", views: 4210, contacts: 84, status: "ativo" },
            { name: "Jeep Compass Limited 2024", views: 3890, contacts: 71, status: "ativo" },
            { name: "Honda Civic Touring 2022", views: 3120, contacts: 58, status: "ativo" },
            { name: "VW T-Cross Highline 2023", views: 2870, contacts: 49, status: "ativo" },
          ].map((c, i) => (
            <li key={c.name} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-xs font-black text-primary-container">{i + 1}</span>
                <div>
                  <p className="text-sm font-bold text-white">{c.name}</p>
                  <p className="text-xs text-white/40">{c.views.toLocaleString("pt-BR")} views · {c.contacts} contatos</p>
                </div>
              </div>
              <ErpStatusBadge status={c.status} />
            </li>
          ))}
        </ul>
      </div>
    </ErpLayout>
  );
}
