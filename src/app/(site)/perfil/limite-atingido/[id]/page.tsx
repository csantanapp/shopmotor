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

interface LimitInfo {
  isPJ: boolean;
  limit: number;
  activeCount: number;
}

export default function LimiteAtingidoPage() {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [info, setInfo] = useState<LimitInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/vehicles/${id}`).then(r => r.json()),
      fetch("/api/vehicles/check-limit").then(r => r.json()),
    ]).then(([vData, lData]) => {
      setVehicle(vData.vehicle ?? null);
      setInfo({ isPJ: lData.isPJ ?? false, limit: lData.limit ?? 3, activeCount: lData.activeCount ?? 0 });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
      </div>
    );
  }

  const cover = vehicle?.photos[0]?.url ?? null;
  const isPJ = info?.isPJ ?? false;
  const limit = info?.limit ?? (isPJ ? 20 : 3);

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
          Você está usando todas as{" "}
          <strong>{limit} vagas gratuitas</strong> simultâneas da sua conta.
          Escolha como deseja proceder com o novo anúncio.
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
            <p className="font-bold text-on-surface truncate">
              {vehicle.model}{vehicle.version ? ` ${vehicle.version}` : ""}
            </p>
            <p className="text-xs text-on-surface-variant">
              {vehicle.yearFab} · {vehicle.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })}
            </p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 flex-shrink-0">
            Salvo
          </span>
        </div>
      )}

      {/* Opções */}
      <div className="space-y-4">

        {/* ── Opção 1: Impulsionar (PF e PJ) ── */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline/10 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-yellow-50">
              <Icon name="rocket_launch" className="text-2xl text-yellow-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-black text-on-surface text-base">Publicar agora com impulsionamento</h2>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                  A partir de R$ 17,90
                </span>
              </div>
              <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                Escolha um dos planos pontuais — sem assinatura, pagamento único por anúncio — e
                publique imediatamente, sem precisar esperar por vaga gratuita.
              </p>
              {isPJ && (
                <ul className="mt-3 space-y-1.5">
                  {[
                    { name: "Turbo", price: "R$ 17,90", days: "7 dias", desc: "Topo das buscas, selo Destaque e galeria" },
                    { name: "Destaque", price: "R$ 27,90", days: "15 dias", desc: "Posicionamento privilegiado, prioridade em filtros" },
                    { name: "Super Destaque", price: "R$ 47,90", days: "30 dias", desc: "Topo absoluto, seção Elite da Home" },
                  ].map(p => (
                    <li key={p.name} className="flex items-start gap-2 text-xs text-on-surface-variant">
                      <Icon name="check_circle" className="text-primary text-sm mt-0.5 flex-shrink-0" />
                      <span><strong className="text-on-surface">{p.name}</strong> — {p.price} · {p.days} · {p.desc}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <Link
            href={`/perfil/impulsionar/${id}?upgrade=1`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-black uppercase tracking-widest transition-all bg-primary-container text-on-primary-container hover:-translate-y-0.5"
          >
            <Icon name="rocket_launch" className="text-base" />
            Escolher plano de impulsionamento
          </Link>
        </div>

        {/* ── Opção 2: Plano Comercial (SOMENTE PJ) ── */}
        {isPJ && (
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline/10 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-purple-50">
                <Icon name="workspace_premium" className="text-2xl text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-black text-on-surface text-base">Contratar plano comercial</h2>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    Starter / Pro / Elite
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                  Assine um plano e ganhe cotas adicionais de anúncios{" "}
                  <strong>independentes</strong> das {limit} vagas gratuitas —
                  além de mais visibilidade, recursos exclusivos de loja e destaque na plataforma.
                </p>
                <ul className="mt-3 space-y-1.5">
                  {[
                    { name: "Starter", desc: "+5 anúncios (25 no total), 2 destaques/mês" },
                    { name: "Pro", desc: "+15 anúncios (35 no total), 5 destaques/mês, acesso ao lead" },
                    { name: "Elite", desc: "+30 anúncios (50 no total), analytics, financiamento, home" },
                  ].map(p => (
                    <li key={p.name} className="flex items-start gap-2 text-xs text-on-surface-variant">
                      <Icon name="check_circle" className="text-purple-500 text-sm mt-0.5 flex-shrink-0" />
                      <span><strong className="text-on-surface">{p.name}</strong> — {p.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Link
              href="/perfil/plano"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-black uppercase tracking-widest transition-all border-2 border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Icon name="workspace_premium" className="text-base" />
              Ver planos comerciais
            </Link>
          </div>
        )}

        {/* ── Opção 3: Aguardar vaga (PF e PJ) ── */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline/10 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-blue-50">
              <Icon name="hourglass_empty" className="text-2xl text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-black text-on-surface text-base">Aguardar vaga gratuita</h2>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  Gratuito
                </span>
              </div>
              <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                Seu anúncio fica salvo em Inativos sem custo algum. Quando uma das{" "}
                {isPJ ? "20" : "3"} vagas for liberada — por exclusão, venda ou esgotamento de
                ciclo de outro anúncio — você recebe uma notificação e o botão{" "}
                <strong>Publicar grátis</strong> aparece automaticamente no anúncio (fila FIFO).
              </p>
            </div>
          </div>
          <Link
            href="/perfil/meus-anuncios"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-black uppercase tracking-widest transition-all border-2 border-outline/20 text-on-surface hover:bg-surface-container"
          >
            <Icon name="hourglass_empty" className="text-base" />
            Aguardar e publicar depois
          </Link>
        </div>

      </div>
    </div>
  );
}
