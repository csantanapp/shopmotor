"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import ErpLayout from "@/components/erp/ErpLayout";

type Priority = "alta" | "media" | "baixa";

interface Opportunity {
  id: string;
  type: string;
  priority: Priority;
  impact: string;
  vehicle?: string;
  vehicleId?: string;
  lead?: string;
  conversationId?: string;
  waitingTime?: string;
  recommendation: string;
  icon: string;
}

interface Stats {
  activeVehicles: number;
  totalVehicles: number;
  totalViews: number;
  totalFavorites: number;
  openConversations: number;
  vendasMes: number;
  receitaMes: number;
  vendasSemana: number;
}

const priorityStyle: Record<Priority, string> = {
  alta:  "bg-red-100 text-red-600 border-red-300",
  media: "bg-yellow-100 text-yellow-700 border-yellow-300",
  baixa: "bg-gray-100 text-gray-500 border-gray-300",
};

const priorityLabel: Record<Priority, string> = {
  alta:  "Prioridade alta",
  media: "Prioridade média",
  baixa: "Otimização",
};

function actionHref(op: Opportunity): { primary?: string; whatsapp?: string } {
  if (op.conversationId) return { primary: `/vendas/leads` };
  if (op.vehicleId)      return { primary: `/vendas/estoque/${op.vehicleId}` };
  return {};
}

function OpportunityCard({ op }: { op: Opportunity }) {
  const hrefs = actionHref(op);

  const btnCls = "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs transition font-black";

  return (
    <div className="relative flex flex-col rounded-xl border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {op.priority === "alta" && (
        <span className="absolute right-4 top-4 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
        </span>
      )}

      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
          <Icon name={op.icon} className="text-xl text-yellow-600" />
        </div>
        <div className="flex-1">
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${priorityStyle[op.priority]}`}>
            {priorityLabel[op.priority]}
          </span>
          <h3 className="mt-2 text-sm font-bold text-gray-900 leading-snug">{op.type}</h3>
        </div>
      </div>

      {(op.vehicle || op.lead) && (
        <div className="mt-4 space-y-1 text-xs">
          {op.vehicle && <p className="text-gray-400">Veículo: <span className="font-bold text-gray-700">{op.vehicle}</span></p>}
          {op.lead    && <p className="text-gray-400">Lead: <span className="font-bold text-gray-700">{op.lead}</span></p>}
        </div>
      )}

      <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
        <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-yellow-700">
          <Icon name="bolt" className="text-sm" /> Ação recomendada
        </p>
        <p className="mt-1 text-sm font-bold text-gray-800">{op.recommendation}</p>
      </div>

      <div className="mt-3 flex items-center gap-3 text-[11px]">
        <span className="inline-flex items-center gap-1 font-bold text-green-600">
          <Icon name="trending_up" className="text-sm" /> {op.impact}
        </span>
        {op.waitingTime && (
          <span className="inline-flex items-center gap-1 text-gray-400">
            <Icon name="schedule" className="text-sm" /> {op.waitingTime}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {hrefs.primary && (
          <Link href={hrefs.primary} className={`${btnCls} bg-primary-container text-black shadow shadow-primary-container/20 hover:opacity-90`}>
            {op.conversationId ? "Ver conversa" : "Ver veículo"}
          </Link>
        )}
        {op.icon === "rocket_launch" && op.vehicleId && (
          <Link href="/vendas/anuncios" className={`${btnCls} bg-primary-container text-black shadow shadow-primary-container/20 hover:opacity-90`}>
            Impulsionar
          </Link>
        )}
        {op.icon === "publish" && op.vehicleId && (
          <Link href={`/vendas/estoque/${op.vehicleId}`} className={`${btnCls} bg-primary-container text-black shadow shadow-primary-container/20 hover:opacity-90`}>
            Publicar
          </Link>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, accent }: { icon: string; label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${accent ? "border-primary-container/40 bg-yellow-50" : "border-black/10 bg-white"}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon name={icon} className={`text-base ${accent ? "text-yellow-700" : "text-gray-400"}`} />
        <p className={`text-[11px] font-black uppercase tracking-wider ${accent ? "text-yellow-700" : "text-gray-400"}`}>{label}</p>
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function CentralOportunidades() {
  const [ops, setOps]       = useState<Opportunity[]>([]);
  const [stats, setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res  = await fetch("/api/vendas/oportunidades");
    const data = await res.json();
    setOps(data.opportunities ?? []);
    setStats(data.stats ?? null);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const counts = {
    alta:  ops.filter(o => o.priority === "alta").length,
    media: ops.filter(o => o.priority === "media").length,
    baixa: ops.filter(o => o.priority === "baixa").length,
  };

  const fmt = (n: number) => n.toLocaleString("pt-BR");

  return (
    <ErpLayout
      title="Central de Oportunidades"
      subtitle={loading ? "Carregando…" : `${ops.length} ação${ops.length !== 1 ? "ões" : ""} identificadas agora`}
    >
      {/* Hero */}
      <section className="rounded-2xl border border-primary-container/40 bg-yellow-50 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-container/20 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-yellow-700">
              <Icon name="auto_awesome" className="text-sm" /> Sales OS
            </span>
            <h2 className="mt-3 text-2xl md:text-3xl font-black tracking-tight text-gray-900">
              O que fazer agora para vender mais
            </h2>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              Prioridades automáticas baseadas nos seus leads, anúncios, estoque e comportamento de compradores.
            </p>
          </div>
          <Link
            href="/vendas/direcao"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary-container text-black px-5 py-2.5 text-sm font-black shadow shadow-primary-container/20 transition hover:opacity-90"
          >
            Ver dashboard <Icon name="arrow_forward" className="text-base" />
          </Link>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-red-200 bg-white p-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-red-500">Prioridade alta</p>
            <p className="mt-1 text-2xl font-black text-gray-900">{loading ? "—" : `${counts.alta} ações`}</p>
            <p className="text-xs text-gray-400 mt-0.5">Cada minuto reduz a chance de fechamento</p>
          </div>
          <div className="rounded-xl border border-yellow-200 bg-white p-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-yellow-700">Prioridade média</p>
            <p className="mt-1 text-2xl font-black text-gray-900">{loading ? "—" : `${counts.media} ações`}</p>
            <p className="text-xs text-gray-400 mt-0.5">Ajustes que aceleram o estoque</p>
          </div>
          <div className="rounded-xl border border-black/10 bg-white p-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">Otimização</p>
            <p className="mt-1 text-2xl font-black text-gray-900">{loading ? "—" : `${counts.baixa} ações`}</p>
            <p className="text-xs text-gray-400 mt-0.5">Melhorias contínuas de performance</p>
          </div>
        </div>
      </section>

      {/* KPIs reais */}
      {stats && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <StatCard icon="inventory" label="Veículos ativos" value={String(stats.activeVehicles)} sub={`de ${stats.totalVehicles} no estoque`} />
          <StatCard icon="visibility" label="Views totais" value={fmt(stats.totalViews)} sub="acumuladas nos anúncios" />
          <StatCard icon="chat" label="Leads abertos" value={String(stats.openConversations)} sub="aguardando resposta" accent={stats.openConversations > 0} />
          <StatCard icon="sell" label="Vendas no mês" value={String(stats.vendasMes)} sub={stats.receitaMes > 0 ? `R$ ${fmt(stats.receitaMes)}` : "nenhuma registrada"} accent={stats.vendasMes > 0} />
        </div>
      )}

      {/* Lista de oportunidades */}
      {loading ? (
        <div className="flex items-center justify-center py-24 mt-6">
          <span className="h-8 w-8 rounded-full border-2 border-primary-container/30 border-t-primary-container animate-spin" />
        </div>
      ) : ops.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-black/10 bg-white py-20 text-center">
          <Icon name="check_circle" className="text-5xl text-green-400 mb-3" />
          <p className="font-black text-gray-900 text-lg">Tudo em dia!</p>
          <p className="text-sm text-gray-400 mt-1">Nenhuma oportunidade pendente no momento.</p>
        </div>
      ) : (
        <>
          <h3 className="mt-8 mb-4 text-xs font-black uppercase tracking-widest text-gray-400">
            Suas próximas ações ({ops.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ops.map(o => <OpportunityCard key={o.id} op={o} />)}
          </div>
        </>
      )}
    </ErpLayout>
  );
}
