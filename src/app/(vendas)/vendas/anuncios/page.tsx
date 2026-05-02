"use client";

import { useState } from "react";
import ErpLayout from "@/components/erp/ErpLayout";
import ErpStatusBadge from "@/components/erp/ErpStatusBadge";
import Icon from "@/components/ui/Icon";

const recommended = [
  { car: "Toyota Corolla XEi 2023", views: 4210, favs: 184, leads: 38, score: 92 },
  { car: "Jeep Compass Limited 2024", views: 3890, favs: 152, leads: 31, score: 86 },
  { car: "VW T-Cross Highline 2023", views: 2870, favs: 98, leads: 12, score: 74 },
];

const ads = [
  { car: "Toyota Corolla XEi 2023", tier: "super", views: 8900, clicks: 612, contacts: 84 },
  { car: "Jeep Compass Limited 2024", tier: "destaque", views: 5430, clicks: 412, contacts: 71 },
  { car: "Honda Civic Touring 2022", tier: "turbo", views: 3210, clicks: 248, contacts: 58 },
  { car: "VW T-Cross Highline 2023", tier: "normal", views: 1240, clicks: 78, contacts: 18 },
];

const plans = [
  {
    name: "Turbo", tagline: "Mais visibilidade no feed por 3 dias", price: "R$ 49",
    features: ["3x mais visualizações", "Selo Turbo no anúncio", "Aparece no topo da categoria", "Recomendado para estoque novo"],
    cta: "Ativar Turbo", highlight: false,
  },
  {
    name: "Destaque", tagline: "Posição premium por 7 dias", price: "R$ 129",
    features: ["5x mais visualizações", "Posição fixa no topo", "Inclusão em e-mail marketing", "Recomendado para alta intenção"],
    cta: "Ativar Destaque", highlight: true,
  },
  {
    name: "Super Destaque", tagline: "Máxima exposição por 15 dias", price: "R$ 289",
    features: ["10x mais visualizações", "Banner na home do ShopMotor", "Prioridade em buscas", "Recomendado para veículos premium"],
    cta: "Ativar Super", highlight: false,
  },
];

export default function AnunciosPage() {
  const [toast, setToast] = useState("");
  const fire = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  return (
    <ErpLayout title="Impulsionamento Inteligente" subtitle="Aumente o alcance dos veículos certos, no momento certo">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#1a1a1a] border border-white/10 px-4 py-3 text-sm text-white shadow-2xl">{toast}</div>
      )}

      <h3 className="text-xs font-black uppercase tracking-wider text-white/40 mb-4">Planos de impulso</h3>
      <div className="grid gap-6 md:grid-cols-3 mb-10">
        {plans.map((p) => (
          <div key={p.name} className={`rounded-xl border p-6 flex flex-col ${p.highlight ? "border-primary-container/40 bg-primary-container/10" : "border-white/10 bg-[#1a1a1a]"}`}>
            <p className={`text-xs font-black uppercase tracking-wider ${p.highlight ? "text-primary-container" : "text-white/40"}`}>{p.name}</p>
            <p className="mt-1 text-sm text-white/60">{p.tagline}</p>
            <p className="mt-4 text-3xl font-black text-white">{p.price}<span className="text-sm font-normal text-white/40">/anúncio</span></p>
            <ul className="mt-4 space-y-2 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                  <Icon name="check" className="text-primary-container text-sm" /> {f}
                </li>
              ))}
            </ul>
            <button onClick={() => fire(`Plano ${p.name} ativado`)} className={`mt-6 w-full rounded-xl py-2.5 text-sm font-black transition ${p.highlight ? "bg-primary-container text-black hover:opacity-90" : "border border-white/10 text-white hover:bg-white/10"}`}>
              {p.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-primary-container/30 bg-primary-container/5 p-4 mb-6 flex items-start gap-3">
        <Icon name="local_fire_department" className="text-primary-container text-lg shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-primary-container mb-1">Recomendados para impulsionar agora</p>
          <p className="text-sm text-white/60">Veículos com alto volume de visitas, favoritos e leads recentes — momento ideal para investir em alcance.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-10">
        {recommended.map((r) => (
          <div key={r.car} className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
            <p className="text-xs uppercase tracking-wider text-primary-container font-black">Score {r.score}</p>
            <h4 className="mt-1 font-black text-white">{r.car}</h4>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[{ icon: "visibility", val: r.views.toLocaleString("pt-BR") }, { icon: "favorite", val: r.favs }, { icon: "phone", val: r.leads }].map((s, i) => (
                <div key={i} className="rounded-md bg-white/5 py-2">
                  <Icon name={s.icon} className="text-sm text-white/40 mx-auto block" />
                  <p className="mt-0.5 text-sm font-black text-white">{s.val}</p>
                </div>
              ))}
            </div>
            <button onClick={() => fire(`${r.car} impulsionado`)} className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-primary-container py-2 text-sm font-black text-black hover:opacity-90">
              <Icon name="rocket_launch" className="text-sm" /> Impulsionar agora
            </button>
          </div>
        ))}
      </div>

      <h3 className="text-xs font-black uppercase tracking-wider text-white/40 mb-4">Anúncios ativos</h3>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ads.map((a) => (
          <div key={a.car} className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-white/40 uppercase tracking-wider">Anúncio</p>
                <h4 className="mt-1 font-black text-white truncate">{a.car}</h4>
              </div>
              <ErpStatusBadge status={a.tier} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[{ icon: "visibility", val: a.views.toLocaleString("pt-BR") }, { icon: "ads_click", val: a.clicks }, { icon: "phone", val: a.contacts }].map((s, i) => (
                <div key={i} className="rounded-md bg-white/5 py-2">
                  <Icon name={s.icon} className="text-sm text-white/40 mx-auto block" />
                  <p className="mt-0.5 text-sm font-black text-white">{s.val}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ErpLayout>
  );
}
