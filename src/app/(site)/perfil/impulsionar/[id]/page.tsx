"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  version: string | null;
  yearFab: number;
  price: number;
  boostLevel: "NONE" | "DESTAQUE" | "ELITE";
  boostUntil: string | null;
  photos: { url: string }[];
}

type PlanKey = "TURBO" | "DESTAQUE" | "SUPER_DESTAQUE";

const PLANS: {
  key: PlanKey;
  boostLevel: "DESTAQUE" | "ELITE";
  name: string;
  tagline: string;
  icon: string;
  price: number;
  installments: number;
  days: number;
  highlight?: boolean;
  borderClass: string;
  badgeClass: string;
  iconBg: string;
  features: { text: string; strong?: boolean }[];
}[] = [
  {
    key: "TURBO",
    boostLevel: "DESTAQUE",
    name: "Turbo",
    tagline: "Comece a se destacar",
    icon: "trending_up",
    price: 17.90,
    installments: 3,
    days: 7,
    borderClass: "border-outline/20",
    badgeClass: "bg-surface-container text-on-surface",
    iconBg: "bg-surface-container",
    features: [
      { text: "No topo da busca durante 7 dias" },
      { text: "7 dias com selo Destaque" },
      { text: "7 dias na galeria Destaque" },
      { text: "Borda amarela nos resultados de busca" },
      { text: "Posição privilegiada nos anúncios" },
      { text: "Maior visibilidade para compradores" },
    ],
  },
  {
    key: "DESTAQUE",
    boostLevel: "DESTAQUE",
    name: "Destaque",
    tagline: "Mais popular",
    icon: "rocket_launch",
    price: 27.90,
    installments: 3,
    days: 15,
    highlight: true,
    borderClass: "border-primary-container",
    badgeClass: "bg-primary-container text-on-primary-container",
    iconBg: "bg-primary-container",
    features: [
      { text: "No topo da busca durante 15 dias", strong: true },
      { text: "15 dias com selo Destaque", strong: true },
      { text: "15 dias na galeria Destaque", strong: true },
      { text: "Borda amarela nos resultados de busca" },
      { text: "Posição privilegiada na seção Destaques da Home" },
      { text: "Maior visibilidade para compradores" },
    ],
  },
  {
    key: "SUPER_DESTAQUE",
    boostLevel: "ELITE",
    name: "Super Destaque",
    tagline: "Máxima visibilidade",
    icon: "stars",
    price: 47.90,
    installments: 3,
    days: 30,
    borderClass: "border-inverse-surface",
    badgeClass: "bg-inverse-surface text-inverse-on-surface",
    iconBg: "bg-inverse-surface",
    features: [
      { text: "No topo da busca durante 30 dias", strong: true },
      { text: "30 dias com selo Oportunidade", strong: true },
      { text: "30 dias na galeria Destaque", strong: true },
      { text: "Borda exclusiva nos resultados de busca" },
      { text: "Destaque na sessão Elite da Home" },
      { text: "Prioridade sobre todos os outros anúncios" },
      { text: "Maior alcance e visibilidade" },
    ],
  },
];

export default function ImpulsionarPage() {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PlanKey | null>(null);
  const [processing, setProcessing] = useState(false);
  const [boostError, setBoostError] = useState("");

  useEffect(() => {
    fetch(`/api/vehicles/${id}`)
      .then(r => r.json())
      .then(d => {
        setVehicle(d.vehicle);
        setLoading(false);
      });
  }, [id]);

  async function handleBoost() {
    if (!selected) return;
    setBoostError("");
    setProcessing(true);
    try {
      const res = await fetch("/api/payments/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId: id, plan: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBoostError(data.error ?? "Erro ao iniciar pagamento. Tente novamente.");
        return;
      }
      // Redireciona para o checkout do Mercado Pago
      window.location.href = data.initPoint;
    } catch {
      setBoostError("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="w-8 h-8 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
    </div>
  );

  if (!vehicle) return null;

  const cover = vehicle.photos[0]?.url ?? null;
  const boostUntil = vehicle.boostUntil ? new Date(vehicle.boostUntil).toLocaleDateString("pt-BR") : null;
  const selectedPlan = PLANS.find(p => p.key === selected);

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/perfil/meus-anuncios" className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
          <Icon name="arrow_back" className="text-xl" />
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-on-surface uppercase">Impulsionar Anúncio</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Escolha o plano ideal para aumentar a visibilidade do seu veículo</p>
        </div>
      </div>

      {/* Card do veículo */}
      <div className="bg-surface-container-lowest rounded-2xl flex items-center gap-4 p-4 shadow-sm">
        <div className="w-20 h-16 rounded-xl overflow-hidden bg-surface-container flex-shrink-0">
          {cover
            ? <img src={cover} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><Icon name="directions_car" className="text-3xl text-outline" /></div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black uppercase tracking-widest text-primary">{vehicle.brand}</p>
          <p className="font-bold text-on-surface truncate">{vehicle.model}{vehicle.version ? ` ${vehicle.version}` : ""}</p>
          <p className="text-xs text-on-surface-variant">{vehicle.yearFab} · {vehicle.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })}</p>
        </div>
        {vehicle.boostLevel !== "NONE" && boostUntil && (
          <div className="text-right flex-shrink-0">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${vehicle.boostLevel === "ELITE" ? "bg-inverse-surface text-inverse-on-surface" : "bg-primary-container text-on-primary-container"}`}>
              {vehicle.boostLevel} ativo
            </span>
            <p className="text-[10px] text-on-surface-variant mt-1">até {boostUntil}</p>
          </div>
        )}
      </div>

      {/* Planos — 3 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map(plan => {
          const isSelected = selected === plan.key;
          return (
            <button
              key={plan.key}
              onClick={() => setSelected(plan.key)}
              className={`relative text-left rounded-2xl border-2 transition-all overflow-hidden flex flex-col ${isSelected ? `${plan.borderClass} shadow-xl scale-[1.02]` : "border-outline/10 hover:border-outline/30"}`}
            >
              {/* Tag topo */}
              <div className={`px-5 py-3 flex items-center justify-between ${isSelected ? (plan.key === "SUPER_DESTAQUE" ? "bg-inverse-surface" : plan.key === "DESTAQUE" ? "bg-primary-container" : "bg-surface-container-high") : "bg-surface-container"}`}>
                <div className="flex items-center gap-2">
                  <Icon name={plan.icon} className={`text-xl ${isSelected ? (plan.key === "SUPER_DESTAQUE" ? "text-inverse-on-surface" : plan.key === "DESTAQUE" ? "text-on-primary-container" : "text-on-surface") : "text-primary"}`} />
                  <span className={`font-black text-base uppercase tracking-tight ${isSelected ? (plan.key === "SUPER_DESTAQUE" ? "text-inverse-on-surface" : plan.key === "DESTAQUE" ? "text-on-primary-container" : "text-on-surface") : "text-on-surface"}`}>
                    {plan.name}
                  </span>
                </div>
                {plan.highlight && (
                  <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 text-on-primary-container px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
              </div>

              {/* Preço */}
              <div className="px-5 pt-4 pb-3 border-b border-outline/10">
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black text-on-surface">R$ {plan.price.toFixed(2).replace(".", ",")}</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  ou {plan.installments}x de R$ {(plan.price / plan.installments).toFixed(2).replace(".", ",")} • {plan.days} dias
                </p>
              </div>

              {/* Features */}
              <ul className="px-5 py-4 space-y-2 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${f.strong ? "text-on-surface font-semibold" : "text-on-surface-variant"}`}>
                    <Icon name="check_circle" className={`text-sm mt-0.5 flex-shrink-0 ${f.strong ? "text-primary" : "text-outline"}`} />
                    {f.text}
                  </li>
                ))}
              </ul>

              {/* Selecionar */}
              <div className="px-5 pb-5">
                <div className={`w-full text-center py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-colors ${isSelected ? `${plan.badgeClass}` : "bg-surface-container text-on-surface-variant"}`}>
                  {isSelected ? "Selecionado" : "Selecionar"}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Erro boost */}
      {boostError && (
        <div className="flex items-center gap-2 bg-error/10 text-error rounded-xl px-4 py-3 text-sm font-medium">
          <Icon name="error" className="text-lg flex-shrink-0" />
          {boostError}
        </div>
      )}

      {/* CTA */}
      <div className="flex items-center justify-between bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
        <div>
          {selected ? (
            <>
              <p className="font-black text-on-surface">Plano {selectedPlan?.name} selecionado</p>
              <p className="text-sm text-on-surface-variant">
                R$ {selectedPlan?.price.toFixed(2).replace(".", ",")} · {selectedPlan?.days} dias · {selectedPlan?.installments}x de R$ {((selectedPlan?.price ?? 0) / (selectedPlan?.installments ?? 1)).toFixed(2).replace(".", ",")}
              </p>
            </>
          ) : (
            <p className="text-on-surface-variant text-sm">Selecione um plano acima para continuar</p>
          )}
        </div>
        <button
          onClick={handleBoost}
          disabled={!selected || processing}
          className="flex items-center gap-2 bg-primary-container text-on-primary-container font-black px-8 py-3 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          {processing && <span className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />}
          <Icon name="rocket_launch" className="text-lg" />
          Impulsionar agora
        </button>
      </div>

    </div>
  );
}
