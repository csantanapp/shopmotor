"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

// ── MOCK DATA ────────────────────────────────────────────────────────────────

const HERO_BG = "https://lh3.googleusercontent.com/aida-public/AB6AXuDehxNs9I9ak52LfvX_Zc3BVGNcPeZ1FnK3XDjiLtGXZpa8_S7fs9ePvOMwHIMiWFG1MPgWz_J1MhDiXcMV3kWnIN33Y1Ax_jyj6riWUhcLHJFWN2upxKz16lyPpVDyryAsfcodfBkdqXYPgR-GSTeLhBIGITS1-SjCZKAyMu_7hWkDEJFVxesHEpPQXR7YwOEozTX6cZxyBvPl78nytBKtX_iQcHHyN5V6epMv-4viGLiRp8Bj5gkmWv064nm8rRhpNpvZNuqVXsI";

const MOCK_VEHICLES = [
  { id: "v1", brand: "Toyota", model: "Corolla", version: "XEI 2.0", yearFab: 2022, yearModel: 2023, km: 28000, price: 139900, previousPrice: 145000, fipePrice: 142000, condition: "USED", photo: "https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=800&q=80" },
  { id: "v2", brand: "Honda", model: "Civic", version: "EXL 2.0", yearFab: 2021, yearModel: 2022, km: 41000, price: 129900, previousPrice: null, fipePrice: 131000, condition: "USED", photo: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80" },
  { id: "v3", brand: "Jeep", model: "Renegade", version: "Sport 1.8", yearFab: 2023, yearModel: 2023, km: 12000, price: 109900, previousPrice: null, fipePrice: 108000, condition: "USED", photo: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80" },
  { id: "v4", brand: "Volkswagen", model: "T-Cross", version: "Comfortline 200 TSI", yearFab: 2022, yearModel: 2022, km: 35000, price: 119900, previousPrice: 125000, fipePrice: 122000, condition: "USED", photo: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80" },
];

const PLANS = [
  {
    key: "STARTER",
    label: "Starter",
    emoji: "🥈",
    badgeCls: "bg-zinc-700 text-zinc-300",
    store: {
      name: "Auto Veículos SP",
      city: "São Paulo", state: "SP",
      description: "Especialistas em seminovos com procedência e qualidade. Mais de 10 anos no mercado automotivo paulistano.",
      memberSince: "março de 2023",
      vehicleCount: 18,
      avatarUrl: null,
      phone: null,       // não disponível no Starter
      whatsapp: null,    // não disponível
      social: null,      // não disponível
      isVerified: true,
    },
    features: {
      showPhone: false, showSocial: false,
    },
  },
  {
    key: "PRO",
    label: "Pro",
    emoji: "🥇",
    badgeCls: "bg-yellow-500/20 text-yellow-400",
    store: {
      name: "Premium Motors",
      city: "Campinas", state: "SP",
      description: "Multimarcas premium com os melhores seminovos do interior paulista. Financiamento facilitado e garantia de 6 meses.",
      memberSince: "junho de 2022",
      vehicleCount: 32,
      avatarUrl: null,
      phone: "(19) 9 8765-4321",
      whatsapp: "(19) 9 8765-4321",
      social: { instagram: "#", facebook: "#", youtube: null, tiktok: null },
      isVerified: true,
    },
    features: {
      showPhone: true, showSocial: true,
    },
  },
  {
    key: "ELITE",
    label: "Elite 🔥",
    emoji: "💎",
    badgeCls: "bg-orange-500/20 text-orange-400",
    store: {
      name: "Élite Automotores",
      city: "Ribeirão Preto", state: "SP",
      description: "A loja de alta performance do interior. Veículos zero km e seminovos importados com garantia total e atendimento VIP.",
      memberSince: "janeiro de 2021",
      vehicleCount: 47,
      avatarUrl: null,
      phone: "(16) 9 9999-0000",
      whatsapp: "(16) 9 9999-0000",
      social: { instagram: "#", facebook: "#", youtube: "#", tiktok: "#" },
      isVerified: true,
    },
    features: {
      showPhone: true, showSocial: true,
    },
  },
];

const SOCIAL_ICONS = [
  { key: "instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z", label: "Instagram" },
  { key: "facebook",  path: "M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.887v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z", label: "Facebook" },
  { key: "youtube",   path: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z", label: "YouTube" },
  { key: "tiktok",    path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z", label: "TikTok" },
];

// ── VITRINE COMPONENT ─────────────────────────────────────────────────────────

function StoreMockup({ plan }: { plan: typeof PLANS[0] }) {
  const { store, features } = plan;
  const socialKeys = store.social ? SOCIAL_ICONS.filter(s => store.social![s.key as keyof typeof store.social]) : [];

  return (
    <div className="min-h-screen bg-zinc-50 rounded-3xl overflow-hidden border-2 border-zinc-200 shadow-2xl">

      {/* VITRINE */}
      <div className="relative bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={HERO_BG} alt="" className="w-full h-full object-cover opacity-20 blur-[2px] scale-105" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/70 via-zinc-900/80 to-zinc-900" />
        </div>

        <div className="relative px-6 py-10">
          {/* Logo + Nome */}
          <div className="mb-5 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl border-2 border-white/10 bg-white/10 overflow-hidden flex items-center justify-center shadow-2xl flex-shrink-0">
              <span className="text-2xl font-black text-white">{store.name.charAt(0)}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {store.isVerified && (
                  <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                    <Icon name="verified" className="text-xs" /> Verificada
                  </span>
                )}
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide ${plan.badgeCls}`}>
                  {plan.label}
                </span>
              </div>
              <h1 className="text-2xl font-black text-white leading-tight">{store.name}</h1>
            </div>
          </div>

          {/* Cidade */}
          <div className="flex items-center gap-1.5 text-zinc-400 text-sm mb-3">
            <Icon name="location_on" className="text-base text-zinc-500" />
            {store.city}, {store.state}
          </div>

          {/* Descrição */}
          <p className="text-zinc-300 text-sm leading-relaxed mb-5 max-w-md line-clamp-3">
            {store.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-5 mb-6">
            <div className="text-center">
              <p className="text-2xl font-black text-white">{store.vehicleCount}</p>
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Veículos</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="text-sm font-bold text-zinc-300">{store.memberSince}</p>
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Na ShopMotor</p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            {features.showPhone && store.whatsapp && (
              <span className="inline-flex items-center gap-2 bg-green-600 text-white font-black px-5 py-2.5 rounded-full text-sm">
                <Icon name="chat" className="text-base" /> WhatsApp
              </span>
            )}
            {features.showPhone && store.phone && !store.whatsapp && (
              <span className="inline-flex items-center gap-2 bg-white/10 text-white font-bold px-5 py-2.5 rounded-full text-sm">
                <Icon name="call" className="text-base" /> {store.phone}
              </span>
            )}
            {features.showSocial && socialKeys.map(s => (
              <span key={s.key} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d={s.path} />
                </svg>
              </span>
            ))}

            {/* Locked indicators */}
            {!features.showPhone && (
              <span className="inline-flex items-center gap-2 bg-white/5 text-zinc-600 font-bold px-5 py-2.5 rounded-full text-sm border border-white/10 line-through cursor-not-allowed">
                <Icon name="lock" className="text-base" /> WhatsApp — plano Pro+
              </span>
            )}
            {!features.showSocial && (
              <span className="inline-flex items-center gap-2 bg-white/5 text-zinc-600 font-bold px-4 py-2.5 rounded-full text-sm border border-white/10 line-through cursor-not-allowed text-xs">
                <Icon name="lock" className="text-sm" /> Redes — plano Pro+
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ESTOQUE */}
      <div className="px-4 py-8">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-lg font-black text-zinc-900 flex-1">
            Estoque <span className="text-zinc-400 font-normal text-sm">({MOCK_VEHICLES.length})</span>
          </h2>
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-lg" />
            <input type="search" placeholder="Buscar modelo..." readOnly
              className="bg-white border border-zinc-200 rounded-full pl-10 pr-4 py-2 text-sm w-36 cursor-default" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {MOCK_VEHICLES.map(v => (
            <div key={v.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-zinc-100">
              <div className="h-28 overflow-hidden relative bg-zinc-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.photo} alt={v.model} className="w-full h-full object-cover" />
                {v.previousPrice && v.previousPrice > v.price && (
                  <span className="absolute top-2 left-2 bg-green-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded">Baixou</span>
                )}
              </div>
              <div className="p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-yellow-600">{v.brand}</p>
                <p className="font-bold text-sm text-zinc-900 leading-tight">{v.model}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{v.yearModel} · {(v.km / 1000).toFixed(0)}k km</p>
                <p className="text-base font-black text-zinc-900 mt-1">
                  {v.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function LojaPreviewPage() {
  const [active, setActive] = useState(0);

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-zinc-900">Preview — Vitrine da Loja</h1>
            <p className="text-xs text-zinc-500">Visualização de como cada plano aparece na página pública /loja/[slug]</p>
          </div>
          <Link href="/perfil/plano"
            className="bg-zinc-900 text-white text-sm font-black px-5 py-2.5 rounded-full hover:bg-zinc-700 transition-colors">
            Assinar plano
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-screen-xl mx-auto px-6 pt-6">
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 w-fit shadow-sm border border-zinc-100 mb-8">
          {PLANS.map((p, i) => (
            <button key={p.key} onClick={() => setActive(i)}
              className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
                active === i ? "bg-zinc-900 text-white shadow" : "text-zinc-500 hover:text-zinc-900"
              }`}>
              {p.emoji} {p.label}
            </button>
          ))}
        </div>

        {/* Feature diff banner */}
        <div className="mb-6 bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
          <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">Funcionalidades — {PLANS[active].label}</p>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Perfil público", all: true },
              { label: "Vitrine de veículos", all: true },
              { label: "Selo Verificada", all: true },
              { label: "Telefone / WhatsApp", starter: false },
              { label: "Redes sociais", starter: false },
              { label: "Analytics", starter: false },
              { label: "Financiamento", eliteOnly: true },
              { label: "Destaque na Home", eliteOnly: true },
            ].map(f => {
              const isStarter = PLANS[active].key === "STARTER";
              const isElite   = PLANS[active].key === "ELITE";
              const enabled   = f.all || (!f.starter && !isStarter) || (f.eliteOnly && isElite) || (!f.eliteOnly && !f.starter && !isStarter);
              return (
                <span key={f.label} className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
                  enabled ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-400 line-through"
                }`}>
                  <Icon name={enabled ? "check_circle" : "remove"} className="text-sm" />
                  {f.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Store mockup */}
        <div className="max-w-lg mx-auto pb-16">
          <StoreMockup plan={PLANS[active]} />
        </div>
      </div>
    </div>
  );
}
