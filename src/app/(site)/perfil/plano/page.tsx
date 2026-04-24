"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { STORE_PLANS, StorePlan } from "@/lib/store-plans";
import { useAuth } from "@/context/AuthContext";

const plans = [STORE_PLANS.STARTER, STORE_PLANS.PRO, STORE_PLANS.ELITE];

type Subscription = {
  id: string; plan: string; status: string;
  startsAt: string; endsAt: string; amount: number;
};

function PlanoContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const planParam = searchParams.get("plan") as StorePlan | null;
  const subResult = searchParams.get("sub");

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<StorePlan | null>(planParam);

  useEffect(() => {
    fetch("/api/payments/subscription")
      .then(r => r.json())
      .then(d => { setSubscription(d.subscription); setLoading(false); });
  }, []);

  async function subscribe(planKey: StorePlan) {
    setPurchasing(planKey);
    try {
      const res = await fetch("/api/payments/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (data.initPoint) window.location.href = data.initPoint;
      else alert(data.error ?? "Erro ao processar pagamento.");
    } catch {
      alert("Erro de conexão. Tente novamente.");
    }
    setPurchasing(null);
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Feedback pós-pagamento
  if (subResult === "success") return (
    <div className="max-w-lg mx-auto py-16 text-center px-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <Icon name="check_circle" className="text-green-600 text-4xl" />
      </div>
      <h2 className="text-2xl font-black mb-2 text-zinc-900">Assinatura ativada!</h2>
      <p className="text-zinc-500 text-sm mb-6">Sua loja está agora com o plano ativo. Os benefícios já estão disponíveis.</p>
      <Link href="/perfil/loja" className="bg-zinc-900 text-white font-black px-8 py-3 rounded-full text-sm hover:bg-zinc-700 transition-colors">
        Ver minha loja
      </Link>
    </div>
  );

  if (subResult === "failed") return (
    <div className="max-w-lg mx-auto py-16 text-center px-4">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <Icon name="cancel" className="text-red-500 text-4xl" />
      </div>
      <h2 className="text-2xl font-black mb-2 text-zinc-900">Pagamento não aprovado</h2>
      <p className="text-zinc-500 text-sm mb-6">Não foi possível processar o pagamento. Tente novamente ou use outro método.</p>
      <button onClick={() => router.replace("/perfil/plano")} className="bg-zinc-900 text-white font-black px-8 py-3 rounded-full text-sm hover:bg-zinc-700 transition-colors">
        Tentar novamente
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-zinc-900">Plano da Loja</h1>
        <p className="text-zinc-500 text-sm mt-1">Gerencie sua assinatura e benefícios</p>
      </div>

      {/* Assinatura ativa */}
      {subscription && subscription.status === "active" && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 flex items-start gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon name="verified" className="text-green-600 text-xl" />
          </div>
          <div className="flex-1">
            <p className="font-black text-zinc-900">
              Plano {STORE_PLANS[subscription.plan as StorePlan]?.name ?? subscription.plan} ativo
            </p>
            <p className="text-sm text-zinc-500 mt-0.5">
              Válido até {new Date(subscription.endsAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
          </div>
          <span className="text-xs font-black bg-green-600 text-white px-3 py-1 rounded-full">Ativo</span>
        </div>
      )}

      {/* Sem assinatura */}
      {!subscription && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex items-center gap-3">
          <Icon name="info" className="text-amber-500 text-xl flex-shrink-0" />
          <p className="text-sm text-zinc-700">Você ainda não possui um plano ativo. Assine para desbloquear os benefícios da loja.</p>
        </div>
      )}

      {/* Grid de planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map(plan => {
          const isActive = subscription?.plan === plan.key && subscription?.status === "active";
          const isElite = plan.key === "ELITE";
          const isPro = plan.key === "PRO";
          const isLoading = purchasing === plan.key;

          return (
            <div key={plan.key}
              className={`rounded-2xl border-2 p-6 transition-all cursor-pointer ${
                isActive ? "border-green-400 bg-green-50" :
                selectedPlan === plan.key ? "border-yellow-500 bg-yellow-50" :
                isPro ? "border-yellow-300 bg-white" :
                isElite ? "border-zinc-900 bg-zinc-900 text-white" :
                "border-zinc-200 bg-white"
              }`}
              onClick={() => setSelectedPlan(plan.key as StorePlan)}
            >
              <div className="text-xl mb-2">{plan.emoji}</div>
              <h3 className={`text-lg font-black mb-1 ${isElite && !isActive ? "text-white" : "text-zinc-900"}`}>{plan.name}</h3>
              <p className={`text-2xl font-black mb-4 ${isElite && !isActive ? "text-yellow-400" : "text-zinc-900"}`}>
                {plan.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })}
                <span className={`text-xs font-normal ml-1 ${isElite && !isActive ? "text-zinc-400" : "text-zinc-400"}`}>/mês</span>
              </p>

              <ul className={`space-y-1.5 text-xs mb-5 ${isElite && !isActive ? "text-zinc-300" : "text-zinc-500"}`}>
                <li>✓ {plan.anunciosTotal} anúncios no total</li>
                <li>✓ {plan.destaques} destaques/mês</li>
                {plan.socialLinks && <li>✓ Links redes sociais</li>}
                {plan.analytics && <li>✓ Analytics</li>}
                {plan.financiamento && <li>✓ Simulação financiamento</li>}
                {plan.homeDestaque && <li>✓ Destaque na Home</li>}
              </ul>

              {isActive ? (
                <div className="w-full text-center bg-green-600 text-white font-black py-2.5 rounded-full text-xs">
                  Plano atual ✓
                </div>
              ) : (
                <button
                  onClick={e => { e.stopPropagation(); subscribe(plan.key as StorePlan); }}
                  disabled={!!isLoading}
                  className={`w-full font-black py-2.5 rounded-full text-xs uppercase tracking-wider transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${
                    isElite ? "bg-yellow-500 text-black hover:bg-yellow-400" :
                    isPro ? "bg-zinc-900 text-white hover:bg-zinc-700" :
                    "border-2 border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  {isLoading && <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />}
                  {subscription ? "Mudar para " + plan.name : "Assinar " + plan.name}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-zinc-400 text-center mt-6">
        Pagamento seguro via Mercado Pago · PIX, boleto ou cartão · Cancele quando quiser ·{" "}
        <Link href="/planos" className="underline hover:text-zinc-600">Ver comparativo completo</Link>
      </p>
    </div>
  );
}

export default function PlanoPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <PlanoContent />
    </Suspense>
  );
}
