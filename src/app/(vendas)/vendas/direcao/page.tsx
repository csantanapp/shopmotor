"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ErpLayout from "@/components/erp/ErpLayout";
import ErpKpiCard from "@/components/erp/ErpKpiCard";
import ErpStatusBadge from "@/components/erp/ErpStatusBadge";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, LineChart, Line,
} from "recharts";

const GOLD  = "#ffd709";
const GOLD2 = "#e6c200";
const BORDER = "rgba(0,0,0,0.08)";
const MUTED  = "rgba(0,0,0,0.35)";
const TT = { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#111" };

interface Kpis {
  hotLeads: number;
  openLeads: number;
  previsaoVendas: number;
  tempoMedioResp: string;
  highChanceVehicles: number;
  stalePriceVehicles: number;
  boostCandidates: number;
  activeVehicles: number;
  vendasSemana: number;
  vendasMes: number;
  receitaSemana: number;
  receitaMes: number;
  totalViews: number;
  totalFavorites: number;
}

interface TopVehicle {
  id: string; name: string; views: number;
  contacts: number; favorites: number;
  status: string; price: number; cover: string | null;
}

interface ChartPoint { d: string; leads?: number; vendas?: number; receita?: number }
interface AdsPoint   { name: string; v: number }
interface PotPoint   { cat: string; v: number }

function Spinner() {
  return (
    <div className="flex items-center justify-center h-full">
      <span className="h-6 w-6 rounded-full border-2 border-primary-container/30 border-t-primary-container animate-spin" />
    </div>
  );
}

function fmt(n: number)  { return n.toLocaleString("pt-BR"); }
function fmtR(n: number) { return n >= 1_000_000 ? `R$ ${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `R$ ${(n / 1_000).toFixed(0)}k` : `R$ ${fmt(n)}`; }

export default function DirecaoPage() {
  const [kpis, setKpis]       = useState<Kpis | null>(null);
  const [leadsC, setLeadsC]   = useState<ChartPoint[]>([]);
  const [salesC, setSalesC]   = useState<ChartPoint[]>([]);
  const [adsP, setAdsP]       = useState<AdsPoint[]>([]);
  const [potP, setPotP]       = useState<PotPoint[]>([]);
  const [topV, setTopV]       = useState<TopVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vendas/direcao")
      .then(r => r.json())
      .then(d => {
        setKpis(d.kpis);
        setLeadsC(d.leadsChart  ?? []);
        setSalesC(d.salesChart  ?? []);
        setAdsP(d.adsPerf       ?? []);
        setPotP(d.potential     ?? []);
        setTopV(d.topVehicles   ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const leadsWeekDelta = leadsC.length >= 2
    ? Math.round(((leadsC[leadsC.length - 1].leads ?? 0) - (leadsC[0].leads ?? 0)) / Math.max(leadsC[0].leads ?? 1, 1) * 100)
    : null;

  return (
    <ErpLayout title="Dashboard de Direção" subtitle="Sua semana de vendas em uma tela">

      {/* ── Hero / Previsão ── */}
      <section className="rounded-2xl border border-primary-container/40 bg-[#fffbe6] p-6 md:p-8 mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-container/20 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-yellow-700">
          Previsão de vendas
        </span>
        <h2 className="mt-3 text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          {loading ? (
            <span className="opacity-30">Calculando…</span>
          ) : kpis && kpis.previsaoVendas > 0 ? (
            <>Você pode vender <span className="text-yellow-600">{kpis.previsaoVendas} veículo{kpis.previsaoVendas !== 1 ? "s" : ""}</span> esta semana</>
          ) : (
            <>Nenhuma venda prevista — <span className="text-yellow-600">ative leads agora</span></>
          )}
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Baseado nos seus leads abertos, anúncios em alta e histórico de vendas.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[
            { n: loading ? "—" : String(kpis?.hotLeads ?? 0),           t: "Leads prontos para fechamento",    c: "text-green-600" },
            { n: loading ? "—" : String(kpis?.stalePriceVehicles ?? 0), t: "Veículos precisam ajuste de preço", c: "text-yellow-600" },
            { n: loading ? "—" : String(kpis?.boostCandidates ?? 0),    t: "Anúncios para impulsionar",         c: "text-blue-600" },
            { n: loading ? "—" : String(kpis?.openLeads ?? 0),          t: "Leads aguardando resposta",         c: "text-red-500" },
          ].map(b => (
            <div key={b.t} className="rounded-xl border border-black/10 bg-white p-4">
              <p className={`text-3xl font-black ${b.c}`}>{b.n}</p>
              <p className="mt-1 text-xs text-gray-500">{b.t}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── KPIs ── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5 mb-6">
        <ErpKpiCard label="Leads quentes" value={loading ? "—" : String(kpis?.hotLeads ?? 0)} deltaLabel="últimas 24h" icon="local_fire_department" accent={!loading && (kpis?.hotLeads ?? 0) > 0} />
        <ErpKpiCard label="Vendas (semana)" value={loading ? "—" : String(kpis?.vendasSemana ?? 0)} deltaLabel={loading ? "" : `${kpis?.vendasMes ?? 0} no mês`} icon="sell" />
        <ErpKpiCard label="Tempo médio resp." value={loading ? "—" : (kpis?.tempoMedioResp ?? "—")} deltaLabel="baseado em respostas" icon="timer" />
        <ErpKpiCard label="Veículos ativos" value={loading ? "—" : String(kpis?.activeVehicles ?? 0)} deltaLabel={loading ? "" : `${kpis?.highChanceVehicles ?? 0} com score alto`} icon="directions_car" />
        <ErpKpiCard label="Receita (semana)" value={loading ? "—" : fmtR(kpis?.receitaSemana ?? 0)} deltaLabel={loading ? "" : `${fmtR(kpis?.receitaMes ?? 0)} no mês`} icon="payments" accent={!loading && (kpis?.receitaSemana ?? 0) > 0} />
      </div>

      {/* ── Gráficos linha 1 ── */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-2 rounded-xl border border-black/10 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-gray-900">Leads por dia</h3>
              <p className="text-xs text-gray-400">Últimos 7 dias</p>
            </div>
            {!loading && leadsWeekDelta !== null && (
              <span className={`text-xs font-bold ${leadsWeekDelta >= 0 ? "text-green-600" : "text-red-500"}`}>
                {leadsWeekDelta >= 0 ? "+" : ""}{leadsWeekDelta}% semana
              </span>
            )}
          </div>
          <div className="h-64">
            {loading ? <Spinner /> : (
              <ResponsiveContainer>
                <AreaChart data={leadsC}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={GOLD} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                  <XAxis dataKey="d" stroke={MUTED} fontSize={12} />
                  <YAxis stroke={MUTED} fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={TT} />
                  <Area type="monotone" dataKey="leads" name="Leads" stroke={GOLD2} strokeWidth={2.5} fill="url(#g1)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-6">
          <h3 className="font-black text-gray-900">Vendas por dia</h3>
          <p className="text-xs text-gray-400 mb-4">Últimos 7 dias</p>
          <div className="h-64">
            {loading ? <Spinner /> : salesC.every(s => s.vendas === 0) ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-sm text-gray-400 font-medium">Nenhuma venda registrada</p>
                <p className="text-xs text-gray-300 mt-1">Os dados aparecerão conforme você registrar vendas</p>
              </div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={salesC}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                  <XAxis dataKey="d" stroke={MUTED} fontSize={11} />
                  <YAxis stroke={MUTED} fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={TT} />
                  <Bar dataKey="vendas" name="Vendas" fill={GOLD} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Gráficos linha 2 ── */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <div className="rounded-xl border border-black/10 bg-white p-6">
          <h3 className="font-black text-gray-900">Views por tipo de impulso</h3>
          <p className="text-xs text-gray-400 mb-4">Visualizações acumuladas por plano</p>
          <div className="h-64">
            {loading ? <Spinner /> : adsP.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-gray-400">Nenhum dado de impulsionamento</p>
              </div>
            ) : (
              <ResponsiveContainer>
                <BarChart data={adsP}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                  <XAxis dataKey="name" stroke={MUTED} fontSize={11} />
                  <YAxis stroke={MUTED} fontSize={11} />
                  <Tooltip contentStyle={TT} formatter={(v: unknown) => [fmt(v as number), "Views"]} />
                  <Bar dataKey="v" fill={GOLD} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-6">
          <h3 className="font-black text-gray-900">Estoque por categoria</h3>
          <p className="text-xs text-gray-400 mb-4">Valor total do estoque ativo (R$ mil)</p>
          <div className="h-64">
            {loading ? <Spinner /> : potP.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-gray-400">Nenhum veículo ativo no estoque</p>
              </div>
            ) : (
              <ResponsiveContainer>
                <LineChart data={potP}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                  <XAxis dataKey="cat" stroke={MUTED} fontSize={11} />
                  <YAxis stroke={MUTED} fontSize={11} />
                  <Tooltip contentStyle={TT} formatter={(v: unknown) => [`R$ ${fmt(v as number)}k`, "Valor"]} />
                  <Line type="monotone" dataKey="v" stroke={GOLD2} strokeWidth={3} dot={{ r: 5, fill: GOLD }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Top veículos ── */}
      <div className="rounded-xl border border-black/10 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-gray-900">Veículos mais visualizados</h3>
            <p className="text-xs text-gray-400">Aproveite o pico de interesse</p>
          </div>
          {!loading && topV.length > 0 && (
            <span className="text-xs font-bold text-yellow-700 bg-primary-container/20 px-2 py-1 rounded-md uppercase tracking-wider">Hot</span>
          )}
        </div>

        {loading ? (
          <div className="py-8"><Spinner /></div>
        ) : topV.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">Nenhum veículo ativo no estoque.</p>
        ) : (
          <ul className="divide-y divide-black/5">
            {topV.map((v, i) => (
              <li key={v.id} className="flex items-center justify-between py-3 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs font-black text-gray-600">{i + 1}</span>
                  {v.cover && (
                    <img src={v.cover} alt={v.name} className="h-10 w-14 rounded-lg object-cover shrink-0 hidden sm:block" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{v.name}</p>
                    <p className="text-xs text-gray-400">
                      {fmt(v.views)} views · {v.contacts} contatos · {v.favorites} favoritos
                      {v.price > 0 && ` · R$ ${fmt(v.price)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <ErpStatusBadge status={v.status} />
                  <Link href={`/vendas/estoque/${v.id}`}
                    className="rounded-lg border border-black/10 px-2.5 py-1 text-xs font-black text-gray-600 hover:bg-gray-50 transition">
                    Ver
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ErpLayout>
  );
}
