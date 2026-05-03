"use client";

import { useState, useEffect } from "react";
import ErpLayout from "@/components/erp/ErpLayout";
import ErpKpiCard from "@/components/erp/ErpKpiCard";
import Icon from "@/components/ui/Icon";

interface Subscription {
  id: string;
  plan: string;
  status: string;
  amount: number;
  endsAt: string;
}

const PLANS = [
  {
    key: "STARTER",
    name: "Starter",
    tagline: "Comece a vender online",
    price: 297,
    features: [
      "Perfil Loja com identidade visual",
      "25 anúncios (20 grátis + 5 extras)",
      "2 Destaques mensais inclusos",
      "Vitrine personalizada",
      "URL exclusiva + Selo de verificação",
      "Acesso ao WhatsApp do lead",
    ],
    notIncluded: ["E-mail e telefone do lead", "Analytics", "Leads de financiamento"],
    cta: "Assinar Starter",
    highlight: false,
  },
  {
    key: "PRO",
    name: "Pro",
    tagline: "Para lojistas em crescimento",
    price: 697,
    features: [
      "35 anúncios (20 grátis + 15 extras)",
      "5 Destaques mensais inclusos",
      "E-mail e telefone do lead",
      "Analytics de anúncios",
      "Redes sociais no perfil",
      "Vitrine personalizada Pro",
    ],
    notIncluded: ["Leads de financiamento", "Destaque na Home"],
    cta: "Assinar Pro",
    highlight: true,
  },
  {
    key: "ELITE",
    name: "Elite",
    tagline: "Distribuição preferencial de leads",
    price: 1197,
    features: [
      "50 anúncios (20 grátis + 30 extras)",
      "10 Destaques mensais inclusos",
      "Leads de financiamento e seguro",
      "Destaque Lojas na Home",
      "Analytics avançado",
      "Vitrine personalizada Elite",
    ],
    notIncluded: [],
    cta: "Assinar Elite",
    highlight: false,
  },
];

function daysLeft(until: string) {
  return Math.max(0, Math.ceil((new Date(until).getTime() - Date.now()) / 86_400_000));
}

function planColor(plan: string) {
  if (plan === "ELITE") return "text-yellow-700 bg-yellow-50 border-yellow-300";
  if (plan === "PRO")   return "text-blue-700 bg-blue-50 border-blue-300";
  return "text-gray-700 bg-gray-50 border-gray-300";
}

export default function MonetizacaoPage() {
  const [sub, setSub]         = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState("");

  const fire = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    fetch("/api/payments/subscription")
      .then(r => r.json())
      .then(d => { setSub(d.subscription ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function subscribe(planKey: string) {
    const res  = await fetch("/api/payments/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planKey }),
    });
    const data = await res.json();
    if (data.initPoint) {
      window.location.href = data.initPoint;
    } else {
      fire(data.error ?? "Erro ao iniciar assinatura");
    }
  }

  const currentPlan = PLANS.find(p => p.key === sub?.plan);
  const left = sub?.endsAt ? daysLeft(sub.endsAt) : null;

  return (
    <ErpLayout title="Monetização" subtitle="Seu plano atual e opções de upgrade">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-2xl">{toast}</div>
      )}

      {/* KPIs */}
      {!loading && (
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <ErpKpiCard
            label="Plano atual"
            value={sub ? currentPlan?.name ?? sub.plan : "Grátis"}
            icon="workspace_premium"
            accent={!!sub}
          />
          <ErpKpiCard
            label="Valor mensal"
            value={sub ? `R$ ${sub.amount.toLocaleString("pt-BR")}` : "R$ 0"}
            icon="payments"
          />
          <ErpKpiCard
            label="Expira em"
            value={left !== null ? `${left} dias` : "—"}
            icon="calendar_today"
            accent={left !== null && left <= 7}
          />
        </div>
      )}

      {/* Status atual */}
      {!loading && sub && (
        <div className={`rounded-xl border p-5 mb-8 flex items-center gap-4 ${planColor(sub.plan)}`}>
          <Icon name="workspace_premium" className="text-2xl shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-black text-base">Plano {currentPlan?.name ?? sub.plan} ativo</p>
            <p className="text-sm mt-0.5 opacity-70">
              Válido até {new Date(sub.endsAt).toLocaleDateString("pt-BR")} · {left} dias restantes
            </p>
          </div>
          {left !== null && left <= 7 && (
            <span className="shrink-0 rounded-full bg-red-100 text-red-700 border border-red-300 px-3 py-1 text-xs font-black">
              Renovar em breve
            </span>
          )}
        </div>
      )}

      {!loading && !sub && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 mb-8 flex items-start gap-3">
          <Icon name="info" className="text-yellow-600 text-xl shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-yellow-900">Você está no Plano Grátis</p>
            <p className="text-sm text-yellow-700 mt-1">Assine um plano pago para desbloquear mais anúncios, leads qualificados e recursos avançados.</p>
          </div>
        </div>
      )}

      {/* Planos */}
      <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">Planos disponíveis</h3>
      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((p) => {
          const isCurrent = sub?.plan === p.key;
          return (
            <div key={p.key} className={`rounded-xl border p-6 flex flex-col shadow-sm relative ${p.highlight ? "border-primary-container/50 bg-yellow-50" : "border-black/10 bg-white"}`}>
              {isCurrent && (
                <span className="absolute top-4 right-4 rounded-full bg-green-100 text-green-700 border border-green-300 px-2 py-0.5 text-[10px] font-black">Atual</span>
              )}
              <p className={`text-xs font-black uppercase tracking-wider ${p.highlight ? "text-yellow-700" : "text-gray-400"}`}>{p.name}</p>
              <p className="mt-1 text-sm text-gray-500">{p.tagline}</p>
              <p className="mt-4 text-3xl font-black text-gray-900">
                R$ {p.price.toLocaleString("pt-BR")}<span className="text-sm font-normal text-gray-400">/mês</span>
              </p>
              <ul className="mt-4 space-y-2 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Icon name="check" className="text-yellow-600 text-sm shrink-0" /> {f}
                  </li>
                ))}
                {p.notIncluded.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-400 line-through">
                    <Icon name="close" className="text-gray-300 text-sm shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button
                disabled={isCurrent}
                onClick={() => subscribe(p.key)}
                className={`mt-6 w-full rounded-xl py-2.5 text-sm font-black transition disabled:opacity-40 ${p.highlight ? "bg-primary-container text-black hover:opacity-90" : "border border-black/10 text-gray-700 hover:bg-gray-100"}`}
              >
                {isCurrent ? "Plano ativo" : p.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* Help */}
      <div className="mt-8 rounded-xl border border-black/10 bg-white p-5 flex items-start gap-3">
        <Icon name="support_agent" className="text-gray-400 text-xl shrink-0 mt-0.5" />
        <div>
          <p className="font-black text-gray-900 text-sm">Dúvidas sobre planos?</p>
          <p className="text-sm text-gray-500 mt-0.5">
            Fale com nosso time comercial via{" "}
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="text-yellow-700 font-black hover:underline">
              WhatsApp
            </a>{" "}
            ou acesse <strong>Configurações → Plano</strong> para gerenciar sua assinatura.
          </p>
        </div>
      </div>
    </ErpLayout>
  );
}
