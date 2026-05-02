"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import ErpLayout from "@/components/erp/ErpLayout";

type Priority = "alta" | "media" | "baixa";

interface Action {
  label: string;
  tone?: "primary" | "ghost" | "success";
  onClick?: () => void;
}

interface Opportunity {
  id: string;
  type: string;
  priority: Priority;
  impact: string;
  vehicle?: string;
  lead?: string;
  waitingTime?: string;
  recommendation: string;
  icon: string;
  actions: Action[];
}

const priorityStyle: Record<Priority, string> = {
  alta:  "bg-red-500/10 text-red-400 border-red-500/30",
  media: "bg-primary-container/15 text-primary-container border-primary-container/40",
  baixa: "bg-white/5 text-white/50 border-white/10",
};

const priorityLabel: Record<Priority, string> = {
  alta:  "Prioridade alta",
  media: "Prioridade média",
  baixa: "Prioridade baixa",
};

const toneStyle: Record<NonNullable<Action["tone"]>, string> = {
  primary: "bg-primary-container text-black font-black hover:opacity-90 shadow-lg shadow-primary-container/20",
  success: "bg-green-500 text-white font-black hover:opacity-90",
  ghost:   "border border-white/10 bg-white/5 text-white font-semibold hover:bg-white/10",
};

function OpportunityCard({ op }: { op: Opportunity }) {
  const [toast, setToast] = useState("");

  function handle(a: Action) {
    if (a.onClick) { a.onClick(); return; }
    setToast(`${a.label} — em breve`);
    setTimeout(() => setToast(""), 2500);
  }

  return (
    <div className="relative flex flex-col rounded-xl border border-white/10 bg-[#1a1a1a] p-5 shadow-lg transition hover:-translate-y-0.5">
      {op.priority === "alta" && (
        <span className="absolute right-4 top-4 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
        </span>
      )}

      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
          <Icon name={op.icon} className="text-xl text-primary-container" />
        </div>
        <div className="flex-1">
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${priorityStyle[op.priority]}`}>
            {priorityLabel[op.priority]}
          </span>
          <h3 className="mt-2 text-sm font-bold text-white leading-snug">{op.type}</h3>
        </div>
      </div>

      {(op.vehicle || op.lead) && (
        <div className="mt-4 space-y-1 text-xs">
          {op.vehicle && <p className="text-white/40">Veículo: <span className="font-bold text-white/80">{op.vehicle}</span></p>}
          {op.lead    && <p className="text-white/40">Lead: <span className="font-bold text-white/80">{op.lead}</span></p>}
        </div>
      )}

      <div className="mt-4 rounded-lg bg-white/5 p-3">
        <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-primary-container">
          <Icon name="bolt" className="text-sm" /> Ação recomendada
        </p>
        <p className="mt-1 text-sm font-bold text-white">{op.recommendation}</p>
      </div>

      <div className="mt-3 flex items-center gap-3 text-[11px]">
        <span className="inline-flex items-center gap-1 font-bold text-green-400">
          <Icon name="trending_up" className="text-sm" /> {op.impact}
        </span>
        {op.waitingTime && (
          <span className="inline-flex items-center gap-1 text-white/40">
            <Icon name="schedule" className="text-sm" /> {op.waitingTime}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {op.actions.map((a, i) => (
          <button
            key={i}
            onClick={() => handle(a)}
            className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs transition ${toneStyle[a.tone ?? "primary"]}`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {toast && (
        <p className="mt-2 text-xs text-primary-container font-medium">{toast}</p>
      )}
    </div>
  );
}

function InsightCard({ icon, tone, title, description }: {
  icon: string; tone: "default" | "success" | "info";
  title: string; description: string;
}) {
  const bg = { default: "bg-[#1a1a1a] border-white/10", success: "bg-green-500/5 border-green-500/20", info: "bg-blue-500/5 border-blue-500/20" };
  const ic = { default: "bg-white/5 text-primary-container", success: "bg-green-500/10 text-green-400", info: "bg-blue-500/10 text-blue-400" };
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${bg[tone]}`}>
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${ic[tone]}`}>
        <Icon name={icon} className="text-lg" />
      </div>
      <div>
        <p className="text-sm font-bold text-white leading-snug">{title}</p>
        <p className="mt-0.5 text-xs text-white/50 leading-snug">{description}</p>
      </div>
    </div>
  );
}

const ops: Opportunity[] = [
  {
    id: "1", type: "Lead esperando há 18 minutos", priority: "alta",
    impact: "+32% chance de conversão", vehicle: "Toyota Corolla XEi 2023",
    lead: "Rafael Souza", waitingTime: "18 min sem resposta",
    recommendation: "Responder no WhatsApp agora", icon: "chat",
    actions: [{ label: "WhatsApp", tone: "success" }, { label: "Ver detalhes", tone: "ghost" }],
  },
  {
    id: "2", type: "Cliente simulou financiamento", priority: "alta",
    impact: "Alta chance de compra", vehicle: "Jeep Compass Limited 2024",
    lead: "Marcos Lima", waitingTime: "há 42 min",
    recommendation: "Enviar proposta agora", icon: "description",
    actions: [{ label: "Enviar proposta", tone: "primary" }, { label: "WhatsApp", tone: "success" }],
  },
  {
    id: "3", type: "Lead visitou o mesmo carro 3 vezes", priority: "alta",
    impact: "Intenção alta detectada", vehicle: "Honda Civic Touring 2022",
    lead: "Juliana Pires", waitingTime: "última visita há 12 min",
    recommendation: "Chamar agora antes que esfrie", icon: "local_fire_department",
    actions: [{ label: "Ligar agora", tone: "primary" }, { label: "WhatsApp", tone: "success" }],
  },
  {
    id: "4", type: "Veículo com 120 visualizações hoje", priority: "media",
    impact: "Momento ideal para aumentar alcance", vehicle: "VW T-Cross Highline 2023",
    waitingTime: "pico nas últimas 2h",
    recommendation: "Impulsionar este anúncio", icon: "rocket_launch",
    actions: [{ label: "Impulsionar", tone: "primary" }, { label: "Ver anúncio", tone: "ghost" }],
  },
  {
    id: "5", type: "Veículo há 28 dias sem venda", priority: "media",
    impact: "Pode aumentar leads qualificados", vehicle: "Hyundai HB20 Sense 2022",
    waitingTime: "28 dias parado",
    recommendation: "Ajustar preço sugerido −3,5%", icon: "trending_down",
    actions: [{ label: "Ajustar preço", tone: "primary" }, { label: "Manter", tone: "ghost" }],
  },
  {
    id: "6", type: "Anúncio com baixa taxa de clique", priority: "baixa",
    impact: "Melhorar fotos pode dobrar contatos", vehicle: "Honda CB 500F 2024",
    recommendation: "Adicionar mais 4 fotos profissionais", icon: "photo_camera",
    actions: [{ label: "Editar anúncio", tone: "primary" }],
  },
];

export default function CentralOportunidades() {
  const counts = {
    alta:  ops.filter(o => o.priority === "alta").length,
    media: ops.filter(o => o.priority === "media").length,
    baixa: ops.filter(o => o.priority === "baixa").length,
  };

  return (
    <ErpLayout
      title="Central de Oportunidades"
      subtitle="Atualizado agora — o sistema prioriza ações que geram venda"
    >
      {/* Hero */}
      <section className="rounded-2xl border border-primary-container/20 bg-gradient-to-br from-[#1a1a1a] to-[#111] p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-container/15 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-primary-container">
              <Icon name="auto_awesome" className="text-sm" /> Sales OS
            </span>
            <h2 className="mt-3 text-2xl md:text-3xl font-black tracking-tight text-white">
              O que fazer agora para vender mais
            </h2>
            <p className="mt-2 text-sm text-white/60 leading-relaxed">
              Prioridades automáticas baseadas em leads, anúncios, estoque e intenção de compra.
              Não mostramos números — mostramos como vender.
            </p>
          </div>
          <Link
            href="/erp/direcao"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary-container text-black px-5 py-2.5 text-sm font-black shadow-lg shadow-primary-container/20 transition hover:opacity-90"
          >
            Ver previsão da semana <Icon name="arrow_forward" className="text-base" />
          </Link>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-red-400">Prioridade alta</p>
            <p className="mt-1 text-2xl font-black text-white">{counts.alta} ações</p>
            <p className="text-xs text-white/40 mt-0.5">Cada minuto reduz a chance de fechamento</p>
          </div>
          <div className="rounded-xl border border-primary-container/30 bg-primary-container/10 p-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-primary-container">Prioridade média</p>
            <p className="mt-1 text-2xl font-black text-white">{counts.media} ações</p>
            <p className="text-xs text-white/40 mt-0.5">Ajustes que aceleram o estoque</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-white/40">Otimização</p>
            <p className="mt-1 text-2xl font-black text-white">{counts.baixa} ações</p>
            <p className="text-xs text-white/40 mt-0.5">Melhorias contínuas de performance</p>
          </div>
        </div>
      </section>

      {/* Insights */}
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <InsightCard icon="lightbulb" tone="info"
          title="Tempo de resposta é o maior fator de conversão"
          description="Leads respondidos em até 5 minutos têm 4x mais chance de fechar." />
        <InsightCard icon="my_location" tone="success"
          title="O sistema prioriza oportunidades, não dados"
          description="Foque nas 3 ações de alta prioridade primeiro." />
        <InsightCard icon="local_fire_department" tone="default"
          title="Atenção aos veículos em alta"
          description="Anúncios com pico de visualizações merecem impulso imediato." />
      </div>

      {/* Lista de oportunidades */}
      <h3 className="mt-8 mb-4 text-xs font-black uppercase tracking-widest text-white/40">
        Suas próximas ações ({ops.length})
      </h3>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ops.map(o => <OpportunityCard key={o.id} op={o} />)}
      </div>
    </ErpLayout>
  );
}
