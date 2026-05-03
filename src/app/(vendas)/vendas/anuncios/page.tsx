"use client";

import { useState, useEffect, useCallback } from "react";
import ErpLayout from "@/components/erp/ErpLayout";
import ErpStatusBadge from "@/components/erp/ErpStatusBadge";
import Icon from "@/components/ui/Icon";

interface Vehicle {
  id: string;
  marca: string;
  modelo: string;
  versao?: string;
  ano: number;
  preco: number;
  views: number;
  boostLevel: string;
  boostPlan: string;
  boostUntil?: string;
  status: string;
  photos: { url: string }[];
}

const PLANS = [
  {
    key: "TURBO",
    name: "Turbo",
    tagline: "Mais visibilidade no feed por 7 dias",
    price: "R$ 49",
    features: ["3× mais visualizações", "Selo Turbo no anúncio", "Aparece no topo da categoria", "Recomendado para estoque novo"],
    cta: "Ativar Turbo",
    highlight: false,
  },
  {
    key: "DESTAQUE",
    name: "Destaque",
    tagline: "Posição premium por 15 dias",
    price: "R$ 129",
    features: ["5× mais visualizações", "Posição fixa no topo", "Inclusão em e-mail marketing", "Recomendado para alta intenção"],
    cta: "Ativar Destaque",
    highlight: true,
  },
  {
    key: "SUPER_DESTAQUE",
    name: "Super Destaque",
    tagline: "Máxima exposição por 30 dias",
    price: "R$ 289",
    features: ["10× mais visualizações", "Banner na home do ShopMotor", "Prioridade em buscas", "Recomendado para veículos premium"],
    cta: "Ativar Super",
    highlight: false,
  },
];

function boostTier(v: Vehicle): string {
  if (v.boostPlan === "SUPER_DESTAQUE") return "super";
  if (v.boostPlan === "DESTAQUE") return "destaque";
  if (v.boostPlan === "TURBO") return "turbo";
  return "normal";
}

function daysLeft(until?: string) {
  if (!until) return null;
  const d = Math.ceil((new Date(until).getTime() - Date.now()) / 86_400_000);
  return d > 0 ? d : null;
}

function carLabel(v: Vehicle) {
  return `${v.marca} ${v.modelo}${v.versao ? ` ${v.versao}` : ""} ${v.ano}`;
}

export default function AnunciosPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState("");
  const [boosting, setBoosting] = useState<string | null>(null);
  const [pickPlan, setPickPlan] = useState<string | null>(null); // vehicleId waiting for plan selection

  const fire = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    const res  = await fetch("/api/vehicles/mine");
    const data = await res.json();
    setVehicles(data.vehicles ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function applyBoost(vehicleId: string, plan: string) {
    setBoosting(vehicleId);
    setPickPlan(null);
    const res = await fetch(`/api/vehicles/${vehicleId}/boost`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    if (res.ok) {
      fire(`Impulsionamento ${plan} ativado!`);
      await load();
    } else {
      fire("Erro ao aplicar impulsionamento");
    }
    setBoosting(null);
  }

  async function removeBoost(vehicleId: string) {
    setBoosting(vehicleId);
    const res = await fetch(`/api/vehicles/${vehicleId}/boost`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "NONE" }),
    });
    if (res.ok) { fire("Impulsionamento removido"); await load(); }
    setBoosting(null);
  }

  const active   = vehicles.filter(v => v.boostLevel !== "NONE" && v.boostUntil && new Date(v.boostUntil) > new Date());
  const inactive = vehicles.filter(v => v.boostLevel === "NONE" || !v.boostUntil || new Date(v.boostUntil) <= new Date());
  const recommended = [...inactive].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 3);

  return (
    <ErpLayout title="Impulsionamento Inteligente" subtitle="Aumente o alcance dos veículos certos, no momento certo">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-2xl">{toast}</div>
      )}

      {/* Plan picker modal */}
      {pickPlan && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40" onClick={() => setPickPlan(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <p className="font-black text-gray-900 mb-1">Escolha o plano</p>
            <p className="text-xs text-gray-400 mb-4">{carLabel(vehicles.find(v => v.id === pickPlan)!)}</p>
            <div className="flex flex-col gap-3">
              {PLANS.map(p => (
                <button
                  key={p.key}
                  disabled={boosting === pickPlan}
                  onClick={() => applyBoost(pickPlan, p.key)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-black transition hover:opacity-90 ${p.highlight ? "border-primary-container bg-primary-container/10 text-yellow-800" : "border-black/10 text-gray-700 hover:bg-gray-50"}`}
                >
                  <span>{p.name} — {p.tagline}</span>
                  <span className="ml-3 shrink-0">{p.price}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setPickPlan(null)} className="mt-4 w-full text-xs text-gray-400 hover:text-gray-600">Cancelar</button>
          </div>
        </div>
      )}

      {/* Plan cards */}
      <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">Planos de impulso</h3>
      <div className="grid gap-6 md:grid-cols-3 mb-10">
        {PLANS.map((p) => (
          <div key={p.key} className={`rounded-xl border p-6 flex flex-col shadow-sm ${p.highlight ? "border-primary-container/50 bg-yellow-50" : "border-black/10 bg-white"}`}>
            <p className={`text-xs font-black uppercase tracking-wider ${p.highlight ? "text-yellow-700" : "text-gray-400"}`}>{p.name}</p>
            <p className="mt-1 text-sm text-gray-500">{p.tagline}</p>
            <p className="mt-4 text-3xl font-black text-gray-900">{p.price}<span className="text-sm font-normal text-gray-400">/anúncio</span></p>
            <ul className="mt-4 space-y-2 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <Icon name="check" className="text-yellow-600 text-sm" /> {f}
                </li>
              ))}
            </ul>
            <button
              disabled={loading || inactive.length === 0}
              onClick={() => {
                if (inactive.length === 1) { applyBoost(inactive[0].id, p.key); }
                else { setPickPlan(inactive[0]?.id ?? null); }
              }}
              className={`mt-6 w-full rounded-xl py-2.5 text-sm font-black transition disabled:opacity-40 ${p.highlight ? "bg-primary-container text-black hover:opacity-90" : "border border-black/10 text-gray-700 hover:bg-gray-100"}`}
            >
              {p.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Recommended */}
      {!loading && recommended.length > 0 && (
        <>
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 mb-6 flex items-start gap-3">
            <Icon name="local_fire_department" className="text-yellow-600 text-lg shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-yellow-700 mb-1">Recomendados para impulsionar agora</p>
              <p className="text-sm text-yellow-800">Veículos com alto volume de visitas — momento ideal para investir em alcance.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-10">
            {recommended.map((v) => (
              <div key={v.id} className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
                {v.photos[0] && (
                  <img src={v.photos[0].url} alt={carLabel(v)} className="w-full h-32 object-cover rounded-lg mb-3" />
                )}
                <p className="text-xs uppercase tracking-wider text-yellow-700 font-black">
                  {(v.views ?? 0).toLocaleString("pt-BR")} visitas
                </p>
                <h4 className="mt-1 font-black text-gray-900 text-sm leading-tight">{carLabel(v)}</h4>
                <p className="text-xs text-gray-400 mt-0.5">R$ {v.preco?.toLocaleString("pt-BR")}</p>
                <button
                  disabled={boosting === v.id}
                  onClick={() => setPickPlan(v.id)}
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-primary-container py-2 text-sm font-black text-black hover:opacity-90 disabled:opacity-40"
                >
                  <Icon name="rocket_launch" className="text-sm" />
                  {boosting === v.id ? "Ativando…" : "Impulsionar agora"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Active ads */}
      {!loading && (
        <>
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">Anúncios ativos</h3>
          {active.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-black/10 bg-white">
              <Icon name="rocket_launch" className="text-5xl text-gray-200 mb-3" />
              <p className="font-black text-gray-400">Nenhum anúncio impulsionado</p>
              <p className="text-sm text-gray-400 mt-1">Escolha um plano acima para começar.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {active.map((v) => {
                const left = daysLeft(v.boostUntil);
                return (
                  <div key={v.id} className="rounded-xl border border-black/10 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Anúncio</p>
                        <h4 className="mt-1 font-black text-gray-900 text-sm truncate leading-tight">{carLabel(v)}</h4>
                        {left && <p className="text-xs text-gray-400 mt-0.5">{left}d restantes</p>}
                      </div>
                      <ErpStatusBadge status={boostTier(v)} />
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-center mb-3">
                      <div className="rounded-md bg-gray-50 border border-black/5 py-2">
                        <Icon name="visibility" className="text-sm text-gray-400 mx-auto block" />
                        <p className="mt-0.5 text-sm font-black text-gray-900">{(v.views ?? 0).toLocaleString("pt-BR")}</p>
                        <p className="text-[10px] text-gray-400">visitas</p>
                      </div>
                    </div>
                    <button
                      disabled={boosting === v.id}
                      onClick={() => removeBoost(v.id)}
                      className="w-full rounded-lg border border-black/10 py-1.5 text-xs text-gray-500 hover:bg-gray-50 transition disabled:opacity-40"
                    >
                      Cancelar impulso
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {loading && (
        <div className="flex items-center justify-center py-24">
          <span className="h-8 w-8 rounded-full border-2 border-primary-container/30 border-t-primary-container animate-spin" />
        </div>
      )}
    </ErpLayout>
  );
}
