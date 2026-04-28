"use client";

import { useEffect, useState } from "react";
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
  photos: { url: string }[];
}

const OPTIONS = [
  {
    key: "aguardar",
    icon: "hourglass_empty",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
    title: "Aguardar vaga gratuita",
    description:
      "Seu anúncio fica salvo nos Incompletos. Quando uma das suas 20 vagas for liberada (exclusão, venda ou expiração de outro anúncio), você recebe uma notificação para publicar gratuitamente.",
    badge: "Gratuito",
    badgeClass: "bg-green-100 text-green-700",
    cta: "Aguardar e publicar depois",
    ctaClass:
      "border-2 border-outline/20 text-on-surface hover:bg-surface-container",
    href: (id: string) => "/perfil/meus-anuncios",
  },
  {
    key: "impulsionar",
    icon: "rocket_launch",
    iconColor: "text-yellow-600",
    iconBg: "bg-yellow-50",
    title: "Publicar agora com impulsionamento",
    description:
      "Pague um plano pontual (Turbo, Destaque ou Super Destaque) e publique imediatamente — sem precisar esperar por vaga gratuita. O anúncio fica no ar durante o período contratado.",
    badge: "A partir de R$ 17,90",
    badgeClass: "bg-yellow-100 text-yellow-700",
    cta: "Escolher plano de impulsionamento",
    ctaClass:
      "bg-primary-container text-on-primary-container hover:-translate-y-0.5",
    href: (id: string) => `/perfil/impulsionar/${id}?upgrade=1`,
  },
  {
    key: "plano",
    icon: "workspace_premium",
    iconColor: "text-purple-500",
    iconBg: "bg-purple-50",
    title: "Contratar plano comercial",
    description:
      "Assine um plano Starter, Pro ou Elite e ganhe cotas adicionais de anúncios independentes das 20 vagas gratuitas — além de mais visibilidade, recursos de loja e destaque na plataforma.",
    badge: "Starter / Pro / Elite",
    badgeClass: "bg-purple-100 text-purple-700",
    cta: "Ver planos comerciais",
    ctaClass:
      "border-2 border-purple-200 text-purple-700 hover:bg-purple-50",
    href: (id: string) => "/perfil/plano",
  },
];

export default function LimiteAtingidoPage() {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/vehicles/${id}`)
      .then(r => r.json())
      .then(d => { setVehicle(d.vehicle); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
      </div>
    );
  }

  const cover = vehicle?.photos[0]?.url ?? null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-50">
          <Icon name="inventory" className="text-4xl text-orange-500" />
        </div>
        <h1 className="text-3xl font-black tracking-tighter text-on-surface uppercase">
          Limite de vagas atingido
        </h1>
        <p className="text-on-surface-variant text-sm max-w-md mx-auto">
          Você está usando todas as <strong>20 vagas gratuitas</strong> simultâneas. Escolha como deseja proceder com o novo anúncio.
        </p>
      </div>

      {/* Card do veículo salvo */}
      {vehicle && (
        <div className="bg-surface-container-lowest rounded-2xl flex items-center gap-4 p-4 shadow-sm border border-outline/10">
          <div className="w-16 h-14 rounded-xl overflow-hidden bg-surface-container flex-shrink-0">
            {cover
              ? <img src={cover} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><Icon name="directions_car" className="text-2xl text-outline" /></div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black uppercase tracking-widest text-primary">{vehicle.brand}</p>
            <p className="font-bold text-on-surface truncate">{vehicle.model}{vehicle.version ? ` ${vehicle.version}` : ""}</p>
            <p className="text-xs text-on-surface-variant">{vehicle.yearFab} · {vehicle.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })}</p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 flex-shrink-0">
            Salvo
          </span>
        </div>
      )}

      {/* Opções */}
      <div className="space-y-4">
        {OPTIONS.map((opt, i) => (
          <div key={opt.key} className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline/10 space-y-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${opt.iconBg}`}>
                <Icon name={opt.icon} className={`text-2xl ${opt.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-black text-on-surface text-base">{opt.title}</h2>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${opt.badgeClass}`}>
                    {opt.badge}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                  {opt.description}
                </p>
              </div>
            </div>
            <Link
              href={opt.href(id)}
              className={`flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-black uppercase tracking-widest transition-all ${opt.ctaClass}`}
            >
              <Icon name={opt.icon} className="text-base" />
              {opt.cta}
            </Link>
          </div>
        ))}
      </div>

    </div>
  );
}
