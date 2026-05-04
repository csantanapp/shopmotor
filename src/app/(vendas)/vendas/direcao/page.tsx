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
  hotLeads: number; openLeads: number; previsaoVendas: number;
  tempoMedioResp: string; highChanceVehicles: number;
  stalePriceVehicles: number; boostCandidates: number; activeVehicles: number;
  vendasSemana: number; vendasMes: number; receitaSemana: number; receitaMes: number;
  totalViews: number; totalFavorites: number;
}
interface TopVehicle { id: string; name: string; views: number; contacts: number; favorites: number; status: string; price: number; cover: string | null }
interface Faixa      { label: string; count: number }
interface Recente    { id: string; name: string; dias: number; price: number; cover: string | null }
interface Vendedor   { id: string; nome: string; loja: string; mesAtual: number; mesAnterior: number; acumulado: number }
interface UltMsg     { conversationId: string; buyerName: string; buyerAvatar: string | null; vehicleName: string; vehicleId: string | null; vehicleCover: string | null; preview: string; horario: string; unread: boolean }
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

const faixaColor = ["bg-green-500", "bg-yellow-400", "bg-orange-400", "bg-red-400", "bg-red-600"];

export default function DirecaoPage() {
  const [kpis, setKpis]       = useState<Kpis | null>(null);
  const [leadsC, setLeadsC]   = useState<ChartPoint[]>([]);
  const [salesC, setSalesC]   = useState<ChartPoint[]>([]);
  const [adsP, setAdsP]       = useState<AdsPoint[]>([]);
  const [potP, setPotP]       = useState<PotPoint[]>([]);
  const [topV, setTopV]       = useState<TopVehicle[]>([]);
  const [faixas, setFaixas]   = useState<Faixa[]>([]);
  const [recentes, setRecentes] = useState<Recente[]>([]);
  const [tempoMedio, setTempoMedio] = useState(0);
  const [ranking, setRanking] = useState<Vendedor[]>([]);
  const [ultMsg, setUltMsg]   = useState<UltMsg[]>([]);
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
        setFaixas(d.estoque?.faixas   ?? []);
        setRecentes(d.estoque?.recentes ?? []);
        setTempoMedio(d.estoque?.tempoMedio ?? 0);
        setRanking(d.rankingVendedores ?? []);
        setUltMsg(d.ultimasMensagens  ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const leadsWeekDelta = leadsC.length >= 2
    ? Math.round(((leadsC[leadsC.length - 1].leads ?? 0) - (leadsC[0].leads ?? 0)) / Math.max(leadsC[0].leads ?? 1, 1) * 100)
    : null;

  const totalFaixas = faixas.reduce((s, f) => s + f.count, 0);

  return (
    <ErpLayout title="Dashboard de Direção" subtitle="Sua semana de vendas em uma tela">

      {/* ── Hero / Previsão ── */}
      <section className="rounded-2xl border border-primary-container/40 bg-[#fffbe6] p-6 md:p-8 mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-container/20 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-yellow-700">
          Previsão de vendas
        </span>
        <h2 className="mt-3 text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          {loading ? <span className="opacity-30">Calculando…</span>
            : kpis && kpis.previsaoVendas > 0
              ? <>Você pode vender <span className="text-yellow-600">{kpis.previsaoVendas} veículo{kpis.previsaoVendas !== 1 ? "s" : ""}</span> esta semana</>
              : <>Nenhuma venda prevista — <span className="text-yellow-600">ative leads agora</span></>}
        </h2>
        <p className="mt-2 text-sm text-gray-500">Baseado nos seus leads abertos, anúncios em alta e histórico de vendas.</p>
        <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[
            { n: loading ? "—" : String(kpis?.hotLeads ?? 0),           t: "Leads prontos para fechamento",     c: "text-green-600" },
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
        <ErpKpiCard label="Leads quentes"     value={loading ? "—" : String(kpis?.hotLeads ?? 0)}    deltaLabel="últimas 24h"                                     icon="local_fire_department" accent={!loading && (kpis?.hotLeads ?? 0) > 0} />
        <ErpKpiCard label="Vendas (semana)"   value={loading ? "—" : String(kpis?.vendasSemana ?? 0)} deltaLabel={`${kpis?.vendasMes ?? 0} no mês`}              icon="sell" />
        <ErpKpiCard label="Tempo médio resp." value={loading ? "—" : (kpis?.tempoMedioResp ?? "—")}   deltaLabel="baseado em respostas"                           icon="timer" />
        <ErpKpiCard label="Veículos ativos"   value={loading ? "—" : String(kpis?.activeVehicles ?? 0)} deltaLabel={`${kpis?.highChanceVehicles ?? 0} score alto`} icon="directions_car" />
        <ErpKpiCard label="Receita (semana)"  value={loading ? "—" : fmtR(kpis?.receitaSemana ?? 0)}  deltaLabel={fmtR(kpis?.receitaMes ?? 0) + " no mês"}       icon="payments" accent={!loading && (kpis?.receitaSemana ?? 0) > 0} />
      </div>

      {/* ── Gráficos linha 1 ── */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-2 rounded-xl border border-black/10 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="font-black text-gray-900">Leads por dia</h3><p className="text-xs text-gray-400">Últimos 7 dias</p></div>
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
            {loading ? <Spinner /> : salesC.every(s => (s.vendas ?? 0) === 0) ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-1">
                <p className="text-sm text-gray-400 font-medium">Nenhuma venda registrada</p>
                <p className="text-xs text-gray-300">Dados aparecem conforme você registrar vendas</p>
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
              <div className="flex items-center justify-center h-full"><p className="text-sm text-gray-400">Nenhum dado de impulsionamento</p></div>
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
              <div className="flex items-center justify-center h-full"><p className="text-sm text-gray-400">Nenhum veículo ativo no estoque</p></div>
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

      {/* ── Tempo médio no estoque ── */}
      <div className="rounded-xl border border-black/10 bg-white p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-black text-gray-900">Tempo médio no estoque</h3>
            <p className="text-xs text-gray-400">Veículos ativos por faixa de permanência</p>
          </div>
          {!loading && tempoMedio > 0 && (
            <div className="text-right">
              <p className="text-2xl font-black text-gray-900">{tempoMedio} dias</p>
              <p className="text-xs text-gray-400">média atual</p>
            </div>
          )}
        </div>

        {loading ? <div className="h-20"><Spinner /></div> : (
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Barras de faixa */}
            <div className="space-y-3">
              {faixas.map((f, i) => (
                <div key={f.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600 font-medium">{f.label}</span>
                    <span className="font-black text-gray-900">{f.count} veículo{f.count !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${faixaColor[i]}`}
                      style={{ width: totalFaixas > 0 ? `${(f.count / totalFaixas) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Carros cadastrados recentemente */}
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-3">Cadastros recentes (30 dias)</p>
              {recentes.length === 0 ? (
                <p className="text-sm text-gray-400">Nenhum veículo cadastrado recentemente.</p>
              ) : (
                <ul className="space-y-2">
                  {recentes.map(v => (
                    <li key={v.id} className="flex items-center gap-3">
                      {v.cover
                        ? <img src={v.cover} alt={v.name} className="h-9 w-12 rounded-lg object-cover shrink-0" />
                        : <div className="h-9 w-12 rounded-lg bg-gray-100 shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-gray-900 truncate">{v.name}</p>
                        <p className="text-[10px] text-gray-400">{v.dias === 0 ? "hoje" : `há ${v.dias} dia${v.dias !== 1 ? "s" : ""}`} · R$ {fmt(v.price)}</p>
                      </div>
                      <Link href={`/vendas/estoque/${v.id}`} className="shrink-0 text-[10px] font-black text-gray-500 border border-black/10 rounded-lg px-2 py-1 hover:bg-gray-50">Ver</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Ranking de vendedores ── */}
      <div className="rounded-xl border border-black/10 bg-white p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-gray-900">Ranking de Vendedores</h3>
            <p className="text-xs text-gray-400">Vendas por período</p>
          </div>
          <Link href="/vendas/configuracoes" className="text-xs font-black text-yellow-700 hover:underline">Gerenciar vendedores</Link>
        </div>
        {loading ? <div className="h-16"><Spinner /></div> : ranking.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">Nenhum vendedor cadastrado.</p>
            <Link href="/vendas/configuracoes" className="mt-2 inline-block text-xs font-black text-yellow-700 hover:underline">Cadastrar vendedor</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-black/10">
                  <th className="pb-3 text-left font-black">Vendedor</th>
                  <th className="pb-3 text-left font-black">Loja</th>
                  <th className="pb-3 text-center font-black">Mês atual</th>
                  <th className="pb-3 text-center font-black">Mês anterior</th>
                  <th className="pb-3 text-center font-black">Acumulado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {ranking.map((v, i) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black shrink-0 ${i === 0 ? "bg-yellow-400 text-black" : i === 1 ? "bg-gray-200 text-gray-700" : i === 2 ? "bg-orange-200 text-orange-800" : "bg-gray-100 text-gray-500"}`}>{i + 1}</span>
                        <span className="font-black text-gray-900">{v.nome}</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-500 text-xs">{v.loja}</td>
                    <td className="py-3 text-center">
                      <span className={`font-black text-base ${v.mesAtual > 0 ? "text-green-600" : "text-gray-300"}`}>{v.mesAtual}</span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`font-black text-base ${v.mesAnterior > 0 ? "text-gray-700" : "text-gray-300"}`}>{v.mesAnterior}</span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="font-black text-base text-gray-900">{v.acumulado}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Veículos mais visualizados + Últimas mensagens ── */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">

        {/* Top veículos (compacto) */}
        <div className="rounded-xl border border-black/10 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-gray-900">Mais visualizados</h3>
              <p className="text-xs text-gray-400">Aproveite o pico de interesse</p>
            </div>
            {!loading && topV.length > 0 && (
              <span className="text-xs font-bold text-yellow-700 bg-primary-container/20 px-2 py-1 rounded-md uppercase tracking-wider">Hot</span>
            )}
          </div>
          {loading ? <div className="h-20"><Spinner /></div> : topV.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Nenhum veículo ativo.</p>
          ) : (
            <ul className="divide-y divide-black/5">
              {topV.map((v, i) => (
                <li key={v.id} className="flex items-center justify-between py-2.5 gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs font-black text-gray-600">{i + 1}</span>
                    {v.cover && <img src={v.cover} alt={v.name} className="h-8 w-11 rounded-lg object-cover shrink-0 hidden sm:block" />}
                    <div className="min-w-0">
                      <p className="text-xs font-black text-gray-900 truncate">{v.name}</p>
                      <p className="text-[10px] text-gray-400">{fmt(v.views)} views · {v.contacts} contatos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <ErpStatusBadge status={v.status} />
                    <Link href={`/vendas/estoque/${v.id}`} className="rounded-lg border border-black/10 px-2 py-1 text-[10px] font-black text-gray-600 hover:bg-gray-50 transition">Ver</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Últimas mensagens */}
        <div className="rounded-xl border border-black/10 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-gray-900">Últimas mensagens</h3>
              <p className="text-xs text-gray-400">Leads recentes dos seus anúncios</p>
            </div>
            <Link href="/vendas/leads" className="text-xs font-black text-yellow-700 hover:underline">Ver todas</Link>
          </div>
          {loading ? <div className="h-20"><Spinner /></div> : ultMsg.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-gray-400">Nenhuma mensagem recebida ainda.</p>
            </div>
          ) : (
            <ul className="divide-y divide-black/5">
              {ultMsg.map(m => (
                <li key={m.conversationId} className="py-3">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    {m.buyerAvatar
                      ? <img src={m.buyerAvatar} alt={m.buyerName} className="h-8 w-8 rounded-full object-cover shrink-0" />
                      : <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 text-xs font-black text-gray-500">{m.buyerName?.[0] ?? "?"}</div>
                    }
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-black text-gray-900 truncate">{m.buyerName}</p>
                        <span className="text-[10px] text-gray-400 shrink-0">{m.horario}</span>
                      </div>
                      {/* Veículo */}
                      <p className="text-[10px] text-yellow-700 font-black truncate mt-0.5">{m.vehicleName}</p>
                      {/* Preview mensagem */}
                      <p className={`text-xs mt-0.5 truncate ${m.unread ? "text-gray-800 font-medium" : "text-gray-400"}`}>{m.preview || "…"}</p>
                    </div>
                    {m.unread && <span className="h-2 w-2 rounded-full bg-yellow-400 shrink-0 mt-1" />}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

    </ErpLayout>
  );
}
