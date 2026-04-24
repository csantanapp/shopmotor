"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

// ── TIPOS ─────────────────────────────────────────────────────────────────────

type PlanKey = "STARTER" | "PRO" | "ELITE";

interface PlanConfig {
  key: PlanKey;
  label: string;
  emoji: string;
  badgeCls: string;
  price: string;
  features: {
    contactVisible: boolean;
    socialLinks: boolean;
    analytics: boolean;
    financiamento: boolean;
    homeDestaque: boolean;
    boosts: number;
    vehicleLimit: number;
  };
}

const PLANS: PlanConfig[] = [
  {
    key: "STARTER", label: "Starter", emoji: "🥈", price: "R$ 497/mês",
    badgeCls: "bg-zinc-700 text-zinc-300",
    features: { contactVisible: false, socialLinks: false, analytics: false, financiamento: false, homeDestaque: false, boosts: 2, vehicleLimit: 25 },
  },
  {
    key: "PRO", label: "Pro", emoji: "🥇", price: "R$ 897/mês",
    badgeCls: "bg-yellow-500/20 text-yellow-400",
    features: { contactVisible: true, socialLinks: true, analytics: true, financiamento: false, homeDestaque: false, boosts: 5, vehicleLimit: 35 },
  },
  {
    key: "ELITE", label: "Elite 🔥", emoji: "💎", price: "R$ 1.497/mês",
    badgeCls: "bg-orange-500/20 text-orange-400",
    features: { contactVisible: true, socialLinks: true, analytics: true, financiamento: true, homeDestaque: true, boosts: 10, vehicleLimit: 50 },
  },
];

// ── LOCK OVERLAY ──────────────────────────────────────────────────────────────

function Locked({ minPlan = "Pro" }: { minPlan?: string }) {
  return (
    <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] rounded-2xl flex flex-col items-center justify-center gap-2 z-10">
      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
        <Icon name="lock" className="text-zinc-400 text-xl" />
      </div>
      <p className="text-xs font-black text-zinc-500">Disponível no plano {minPlan}+</p>
      <Link href="/perfil/plano" className="text-[11px] font-black text-yellow-600 underline">
        Fazer upgrade
      </Link>
    </div>
  );
}

// ── ANALYTICS MINI CHART ─────────────────────────────────────────────────────

function SparkLine({ color = "#eab308" }: { color?: string }) {
  const pts = [12, 28, 19, 35, 27, 42, 38, 55, 48, 60, 52, 71, 64, 78, 70, 85, 76, 90, 82, 95, 88, 100, 91, 108, 98, 115, 105, 120, 112, 130];
  const max = Math.max(...pts);
  const w = 300, h = 60;
  const path = pts.map((v, i) => `${i === 0 ? "M" : "L"} ${(i / (pts.length - 1)) * w} ${h - (v / max) * (h - 4)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill="url(#grad)" />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ── MANAGEMENT MOCKUP ─────────────────────────────────────────────────────────

function ManagementMockup({ plan }: { plan: PlanConfig }) {
  const f = plan.features;
  const [tab, setTab] = useState<"info" | "social" | "analytics">("info");

  const storeName = plan.key === "STARTER" ? "Auto Veículos SP" : plan.key === "PRO" ? "Premium Motors" : "Élite Automotores";
  const storeSlug = plan.key === "STARTER" ? "auto-veiculos-sp" : plan.key === "PRO" ? "premium-motors" : "elite-automotores";

  return (
    <div className="space-y-5">

      {/* ── HEADER DA LOJA ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black tracking-tighter text-zinc-900 uppercase">Minha Loja</h1>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${plan.badgeCls}`}>
              {plan.emoji} {plan.label}
            </span>
          </div>
          <p className="text-zinc-500 text-sm">Personalize a página pública da sua loja</p>
        </div>
        <div className="flex gap-2">
          <span className="flex items-center gap-1.5 text-sm font-bold text-zinc-500 border border-zinc-200 px-4 py-2 rounded-full">
            <Icon name="open_in_new" className="text-sm" /> Ver loja
          </span>
          <Link href="/perfil/plano"
            className="flex items-center gap-1.5 text-sm font-black text-black bg-yellow-400 px-4 py-2 rounded-full hover:bg-yellow-300 transition-colors">
            <Icon name="card_membership" className="text-sm" /> {plan.price}
          </Link>
        </div>
      </div>

      {/* ── CARD STATUS ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Veículos ativos", value: "18", max: plan.features.vehicleLimit, icon: "directions_car", color: "text-zinc-900" },
          { label: "Destaques restantes", value: plan.features.boosts.toString(), max: plan.features.boosts, icon: "bolt", color: "text-yellow-600" },
          { label: "Visualizações (30d)", value: f.analytics ? "1.240" : "—", icon: "visibility", color: f.analytics ? "text-blue-600" : "text-zinc-300", locked: !f.analytics },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Icon name={stat.icon} className={`text-xl ${stat.locked ? "text-zinc-300" : stat.color}`} />
              {stat.locked && <Icon name="lock" className="text-zinc-300 text-sm" />}
            </div>
            <p className={`text-2xl font-black ${stat.locked ? "text-zinc-300" : stat.color}`}>{stat.value}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">{stat.label}</p>
            {!stat.locked && stat.max && (
              <div className="mt-2 h-1 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full"
                  style={{ width: `${(parseInt(stat.value.replace(".", "")) / stat.max) * 100}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── TABS ── */}
      <div className="flex gap-1 bg-zinc-100 rounded-xl p-1 w-fit">
        {([
          { key: "info",      label: "Informações",   icon: "edit" },
          { key: "social",    label: "Redes Sociais",  icon: "share" },
          { key: "analytics", label: "Analytics",      icon: "bar_chart" },
        ] as { key: "info" | "social" | "analytics"; label: string; icon: string }[]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === t.key ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            }`}>
            <Icon name={t.icon} className="text-base" />
            {t.label}
            {(t.key === "social" && !f.socialLinks) || (t.key === "analytics" && !f.analytics)
              ? <Icon name="lock" className="text-zinc-300 text-xs" /> : null}
          </button>
        ))}
      </div>

      {/* ── TAB: INFORMAÇÕES ── */}
      {tab === "info" && (
        <div className="space-y-4">

          {/* Perfil visual */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-zinc-800 to-zinc-700 relative flex items-center justify-center">
              <span className="text-sm text-white/30 font-bold">Banner em breve</span>
            </div>
            <div className="px-6 pb-6">
              <div className="flex items-end gap-4 -mt-8 mb-4">
                <div className="w-16 h-16 rounded-full border-4 border-white bg-zinc-200 flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-xl font-black text-zinc-500">{storeName.charAt(0)}</span>
                </div>
                <div className="pb-1">
                  <p className="font-black text-zinc-900">{storeName}</p>
                  <p className="text-xs text-zinc-400 font-mono">/loja/{storeSlug}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-black text-zinc-900 border-b border-zinc-100 pb-3">Informações da loja</h2>

            <div className="grid grid-cols-1 gap-4">
              <MockField label="Nome Fantasia" value={storeName} />
              <MockTextarea label="Descrição da loja" value="Especialistas em seminovos com procedência e qualidade. Mais de 10 anos no mercado automotivo." rows={3} />
            </div>

            {/* Contato — gated */}
            <div className="relative">
              <div className={!f.contactVisible ? "opacity-30 pointer-events-none select-none" : ""}>
                <div className="grid grid-cols-1 gap-4">
                  <MockField label="Telefone / WhatsApp" value={f.contactVisible ? "(11) 9 9999-8888" : ""} />
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${f.contactVisible ? "border-yellow-500 bg-yellow-500" : "border-zinc-300"}`}>
                      {f.contactVisible && <Icon name="check" className="text-white text-[10px]" />}
                    </div>
                    <span className="text-sm text-zinc-600">Exibir telefone na página da loja</span>
                  </div>
                </div>
              </div>
              {!f.contactVisible && <Locked minPlan="Pro" />}
            </div>
          </div>

          {/* URL */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
            <h2 className="text-sm font-black text-zinc-900 border-b border-zinc-100 pb-3 mb-4">Link público da loja</h2>
            <div className="flex items-center gap-3 bg-zinc-50 rounded-xl px-4 py-3">
              <Icon name="link" className="text-zinc-400 text-xl flex-shrink-0" />
              <span className="text-sm font-mono text-zinc-600">shopmotor.com.br/loja/{storeSlug}</span>
              <Icon name="content_copy" className="text-zinc-400 text-base ml-auto cursor-pointer" />
            </div>
          </div>

          {/* Destaque home — Elite only */}
          <div className="relative">
            <div className={`bg-white rounded-2xl border shadow-sm p-6 ${!f.homeDestaque ? "border-zinc-100" : "border-yellow-200"}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-black text-zinc-900">Destaque na Home</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Sua loja aparece em destaque na página inicial</p>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors flex items-center px-0.5 ${
                  f.homeDestaque ? "bg-yellow-400" : "bg-zinc-200"
                } ${!f.homeDestaque ? "opacity-30" : ""}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${f.homeDestaque ? "translate-x-6" : ""}`} />
                </div>
              </div>
              {f.homeDestaque && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center gap-2">
                  <Icon name="star" className="text-yellow-500 text-base" />
                  <p className="text-xs font-bold text-yellow-800">Ativo — sua loja aparece na vitrine da home</p>
                </div>
              )}
            </div>
            {!f.homeDestaque && <Locked minPlan="Elite" />}
          </div>

          {/* Financiamento — Elite only */}
          <div className="relative">
            <div className={`bg-white rounded-2xl border shadow-sm p-6 ${!f.financiamento ? "border-zinc-100" : "border-blue-200"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-zinc-900">Simulação de Financiamento</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Habilita simulador de financiamento na vitrine da loja</p>
                </div>
                <div className={`w-12 h-6 rounded-full flex items-center px-0.5 ${
                  f.financiamento ? "bg-blue-500" : "bg-zinc-200"
                } ${!f.financiamento ? "opacity-30" : ""}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${f.financiamento ? "translate-x-6" : ""}`} />
                </div>
              </div>
            </div>
            {!f.financiamento && <Locked minPlan="Elite" />}
          </div>

          <div className="flex justify-end">
            <button className="bg-zinc-900 text-white px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors">
              Salvar alterações
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: REDES SOCIAIS ── */}
      {tab === "social" && (
        <div className="relative">
          <div className={`bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-5 ${!f.socialLinks ? "opacity-40 pointer-events-none select-none" : ""}`}>
            <h2 className="text-sm font-black text-zinc-900 border-b border-zinc-100 pb-3">Links das redes sociais</h2>
            <p className="text-xs text-zinc-500">Estes links aparecem no hero da sua vitrine pública.</p>

            {[
              { icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z", label: "Instagram", color: "from-purple-500 to-pink-500", value: f.socialLinks ? "@premiummotor" : "" },
              { icon: "M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.887v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z", label: "Facebook", color: "from-blue-600 to-blue-700", value: "" },
              { icon: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z", label: "YouTube", color: "from-red-500 to-red-600", value: "" },
              { icon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z", label: "TikTok", color: "from-zinc-900 to-zinc-700", value: "" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d={s.icon} /></svg>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">{s.label}</label>
                  <input type="url" defaultValue={s.value} placeholder={`https://www.${s.label.toLowerCase()}.com/suapagina`}
                    className="block w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400/30 outline-none mt-0.5" />
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-2">
              <button className="bg-zinc-900 text-white px-8 py-2.5 rounded-full font-black text-sm">Salvar redes</button>
            </div>
          </div>
          {!f.socialLinks && <Locked minPlan="Pro" />}
        </div>
      )}

      {/* ── TAB: ANALYTICS ── */}
      {tab === "analytics" && (
        <div className="relative">
          <div className={`space-y-4 ${!f.analytics ? "opacity-30 pointer-events-none select-none" : ""}`}>

            {/* KPIs */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Visitas (30d)", value: "1.240", delta: "+18%", icon: "visibility", positive: true },
                { label: "Leads gerados", value: "34",    delta: "+7%",  icon: "person_add", positive: true },
                { label: "Tempo médio",   value: "2m 14s", delta: "-5%", icon: "schedule",   positive: false },
                { label: "Taxa clique",   value: "4,2%",  delta: "+1,1%", icon: "ads_click", positive: true },
              ].map(k => (
                <div key={k.label} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon name={k.icon} className="text-zinc-400 text-lg" />
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${k.positive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                      {k.delta}
                    </span>
                  </div>
                  <p className="text-xl font-black text-zinc-900">{k.value}</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{k.label}</p>
                </div>
              ))}
            </div>

            {/* Gráfico */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-zinc-900">Visitas últimos 30 dias</h3>
                <span className="text-xs text-zinc-400">Atualizado hoje</span>
              </div>
              <div className="h-20">
                <SparkLine color="#eab308" />
              </div>
            </div>

            {/* Dispositivos + Origens */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
                <h3 className="text-sm font-black text-zinc-900 mb-4">Dispositivos</h3>
                <div className="space-y-2.5">
                  {[
                    { label: "Mobile", pct: 72, color: "bg-yellow-400" },
                    { label: "Desktop", pct: 22, color: "bg-zinc-300" },
                    { label: "Tablet", pct: 6, color: "bg-zinc-200" },
                  ].map(d => (
                    <div key={d.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-600">{d.label}</span>
                        <span className="font-black text-zinc-900">{d.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
                <h3 className="text-sm font-black text-zinc-900 mb-4">Origens</h3>
                <div className="space-y-2">
                  {[
                    { label: "Busca orgânica", count: 580, icon: "search" },
                    { label: "Direto", count: 390, icon: "link" },
                    { label: "Redes sociais", count: 198, icon: "share" },
                    { label: "Outros", count: 72, icon: "more_horiz" },
                  ].map(o => (
                    <div key={o.label} className="flex items-center gap-2 text-xs">
                      <Icon name={o.icon} className="text-zinc-400 text-base flex-shrink-0" />
                      <span className="text-zinc-600 flex-1">{o.label}</span>
                      <span className="font-black text-zinc-900">{o.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Anúncios mais vistos */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <h3 className="text-sm font-black text-zinc-900 mb-4">Anúncios mais vistos</h3>
              <div className="divide-y divide-zinc-100">
                {[
                  { name: "Toyota Corolla XEI 2023", views: 312, leads: 8 },
                  { name: "Honda Civic EXL 2022", views: 245, leads: 5 },
                  { name: "Jeep Renegade Sport 2023", views: 198, leads: 4 },
                  { name: "VW T-Cross Comfortline 2022", views: 167, leads: 3 },
                ].map((a, i) => (
                  <div key={a.name} className="flex items-center gap-3 py-2.5">
                    <span className="text-xs font-black text-zinc-300 w-4">{i + 1}</span>
                    <p className="text-sm text-zinc-700 flex-1">{a.name}</p>
                    <div className="text-right">
                      <p className="text-xs font-black text-zinc-900">{a.views} vis.</p>
                      <p className="text-[10px] text-green-600 font-bold">{a.leads} leads</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {!f.analytics && <Locked minPlan="Pro" />}
        </div>
      )}

    </div>
  );
}

// ── FIELD HELPERS ─────────────────────────────────────────────────────────────

function MockField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">{label}</label>
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-700">{value || <span className="text-zinc-300">—</span>}</div>
    </div>
  );
}

function MockTextarea({ label, value, rows }: { label: string; value: string; rows: number }) {
  return (
    <div>
      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1">{label}</label>
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-700 leading-relaxed" style={{ minHeight: `${rows * 24}px` }}>{value}</div>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function LojaGestaoPreviewPage() {
  const [active, setActive] = useState(1); // default: Pro

  const plan = PLANS[active];

  return (
    <div className="min-h-screen bg-zinc-100">

      {/* Header fixo */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-zinc-900">Preview — Gestão da Loja</h1>
            <p className="text-xs text-zinc-500">Visualização do painel /perfil/loja por plano</p>
          </div>
          <div className="flex gap-2">
            <Link href="/loja/preview" className="text-sm font-bold text-zinc-500 border border-zinc-200 px-4 py-2 rounded-full hover:bg-zinc-50">
              Ver vitrine pública
            </Link>
            <Link href="/perfil/plano" className="bg-zinc-900 text-white text-sm font-black px-5 py-2 rounded-full hover:bg-zinc-700">
              Assinar plano
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 pt-6 pb-16">

        {/* Seletor de plano */}
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 w-fit shadow-sm border border-zinc-100 mb-8">
          {PLANS.map((p, i) => (
            <button key={p.key} onClick={() => setActive(i)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${
                active === i ? "bg-zinc-900 text-white shadow" : "text-zinc-500 hover:text-zinc-900"
              }`}>
              {p.emoji} Plano {p.label.replace(" 🔥", "")}
            </button>
          ))}
        </div>

        {/* Diff de funcionalidades */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm mb-6">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">O que está disponível no plano {plan.label}</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: `Até ${plan.features.vehicleLimit} anúncios`, ok: true },
              { label: `${plan.features.boosts} destaques/mês`, ok: true },
              { label: "Telefone / WhatsApp na vitrine", ok: plan.features.contactVisible },
              { label: "Redes sociais na vitrine", ok: plan.features.socialLinks },
              { label: "Analytics de anúncios", ok: plan.features.analytics },
              { label: "Simulação de financiamento", ok: plan.features.financiamento },
              { label: "Destaque na Home", ok: plan.features.homeDestaque },
            ].map(f => (
              <span key={f.label} className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
                f.ok ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-400 line-through"
              }`}>
                <Icon name={f.ok ? "check_circle" : "remove"} className="text-sm" />
                {f.label}
              </span>
            ))}
          </div>
        </div>

        {/* Mockup lado a lado: sidebar + conteúdo */}
        <div className="flex gap-6">

          {/* Sidebar simulada */}
          <aside className="w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-3 sticky top-24">
              <div className="flex items-center gap-3 px-3 py-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-black text-zinc-500">P</span>
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-black text-zinc-900 truncate">Premium Motors</p>
                  <p className="text-[10px] text-zinc-400">Plano {plan.label}</p>
                </div>
              </div>
              {[
                { icon: "directions_car", label: "Meus anúncios" },
                { icon: "chat_bubble",    label: "Mensagens" },
                { icon: "person",         label: "Minha conta" },
                { icon: "card_membership", label: "Meu Plano" },
                { icon: "storefront",     label: "Minha loja", active: true },
              ].map(item => (
                <div key={item.label} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  item.active ? "bg-zinc-50 text-yellow-600 font-bold" : "text-zinc-500"
                }`}>
                  <Icon name={item.icon} className="text-base" />
                  {item.label}
                </div>
              ))}
            </div>
          </aside>

          {/* Conteúdo principal */}
          <div className="flex-1 min-w-0">
            <ManagementMockup plan={plan} />
          </div>
        </div>
      </div>
    </div>
  );
}
