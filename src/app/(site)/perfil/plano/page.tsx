"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { STORE_PLANS, StorePlan } from "@/lib/store-plans";

const plans = [STORE_PLANS.STARTER, STORE_PLANS.PRO, STORE_PLANS.ELITE];

const COMPARE_ROWS = [
  { label: "Perfil Loja personalizado",     starter: true,  pro: true,  elite: true  },
  { label: "URL exclusiva da loja",         starter: true,  pro: true,  elite: true  },
  { label: "Vitrine Personalizada",         starter: true,  pro: true,  elite: true  },
  { label: "Selo verificado",               starter: true,  pro: true,  elite: true  },
  { label: "Anúncios gratuitos (base)",     starter: "20",  pro: "20",  elite: "20"  },
  { label: "Anúncios extras",               starter: "+5",  pro: "+15", elite: "+30" },
  { label: "Total de anúncios",             starter: "25",  pro: "35",  elite: "50"  },
  { label: "Destaques mensais inclusos",    starter: "2",   pro: "5",   elite: "10"  },
  { label: "Acesso ao WhatsApp",            starter: true,  pro: true,  elite: true  },
  { label: "Links redes sociais",           starter: false, pro: true,  elite: true  },
  { label: "Acesso e-mail + telefone lead", starter: false, pro: true,  elite: true  },
  { label: "Analytics de anúncios",        starter: false, pro: true,  elite: true  },
  { label: "Simulação de financiamento",    starter: false, pro: false, elite: true  },
  { label: "Destaque na Home",              starter: false, pro: false, elite: true  },
];

function Check({ v }: { v: boolean | string }) {
  if (typeof v === "string") return <span className="text-sm font-black text-zinc-800">{v}</span>;
  return v
    ? <Icon name="check_circle" className="text-green-500 text-lg" />
    : <Icon name="remove" className="text-zinc-300 text-lg" />;
}

type Subscription = {
  id: string; plan: string; status: string;
  startsAt: string; endsAt: string; amount: number;
};

function PlanoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const subResult = searchParams.get("sub");

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [isPJ, setIsPJ] = useState<boolean | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/payments/subscription").then(r => r.json()),
      fetch("/api/vehicles/check-limit").then(r => r.json()),
    ]).then(([subData, limitData]) => {
      setSubscription(subData.subscription);
      setIsPJ(limitData.isPJ ?? false);
      setLoading(false);
    });
  }, []);

  // Bloquear PF de acessar esta página
  if (!loading && isPJ === false) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center px-4 space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <Icon name="block" className="text-red-500 text-4xl" />
        </div>
        <h2 className="text-xl font-black text-zinc-900">Acesso restrito</h2>
        <p className="text-zinc-500 text-sm">
          Planos comerciais (Starter, Pro, Elite) são exclusivos para contas Lojista PJ/CNPJ.
          Contas Pessoa Física não têm acesso a esta área.
        </p>
        <Link href="/perfil/meus-anuncios" className="inline-flex items-center gap-2 bg-zinc-900 text-white font-black px-8 py-3 rounded-full text-sm hover:bg-zinc-700 transition-colors">
          <Icon name="arrow_back" className="text-base" />
          Voltar para meus anúncios
        </Link>
      </div>
    );
  }

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

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

  // ── Feedback pós-pagamento ────────────────────────────────────────────────
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
      <p className="text-zinc-500 text-sm mb-6">Não foi possível processar o pagamento. Tente novamente.</p>
      <button onClick={() => router.replace("/perfil/plano")}
        className="bg-zinc-900 text-white font-black px-8 py-3 rounded-full text-sm hover:bg-zinc-700 transition-colors">
        Tentar novamente
      </button>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const activePlan = subscription?.status === "active" ? subscription.plan : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-zinc-900">Plano da Loja</h1>
        <p className="text-zinc-500 text-sm mt-1">Compare e assine o plano ideal para o seu negócio</p>
      </div>

      {/* Banner plano ativo */}
      {activePlan && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon name="verified" className="text-green-600 text-xl" />
          </div>
          <div className="flex-1">
            <p className="font-black text-zinc-900">
              {STORE_PLANS[activePlan as StorePlan]?.emoji} Plano {STORE_PLANS[activePlan as StorePlan]?.name} ativo
            </p>
            <p className="text-sm text-zinc-500 mt-0.5">
              Válido até {new Date(subscription!.endsAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
          </div>
          <span className="text-xs font-black bg-green-600 text-white px-3 py-1.5 rounded-full">Ativo</span>
        </div>
      )}

      {!activePlan && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-center gap-3">
          <Icon name="info" className="text-amber-500 text-xl flex-shrink-0" />
          <p className="text-sm text-zinc-700">Você ainda não possui um plano ativo. Assine para desbloquear os benefícios da loja.</p>
        </div>
      )}

      {/* Cards dos planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {plans.map(plan => {
          const isActive = activePlan === plan.key;
          const isElite = plan.key === "ELITE";
          const isPro = plan.key === "PRO";
          const isLoading = purchasing === plan.key;

          return (
            <div key={plan.key} className={`rounded-2xl border-2 p-6 flex flex-col transition-all ${
              isActive ? "border-green-400 bg-green-50" :
              isPro ? "border-yellow-400 bg-white ring-4 ring-yellow-400/10" :
              isElite ? "border-zinc-900 bg-zinc-900" :
              "border-zinc-200 bg-white"
            }`}>
              {isPro && !isActive && (
                <div className="text-center mb-3">
                  <span className="bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Mais popular</span>
                </div>
              )}

              <div className="text-2xl mb-2">{plan.emoji}</div>
              <h3 className={`text-xl font-black mb-1 ${isElite && !isActive ? "text-white" : "text-zinc-900"}`}>{plan.name}</h3>
              <p className={`text-xs mb-4 ${isElite && !isActive ? "text-zinc-400" : "text-zinc-400"}`}>30 dias · renovável</p>

              <div className="mb-5">
                <span className={`text-3xl font-black ${isElite && !isActive ? "text-yellow-400" : "text-zinc-900"}`}>{fmt(plan.price)}</span>
                <span className={`text-xs ml-1 ${isElite && !isActive ? "text-zinc-400" : "text-zinc-400"}`}>/mês</span>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <Icon name="check_circle" className="text-green-500 text-base flex-shrink-0 mt-0.5" />
                    <span className={`text-xs leading-relaxed ${isElite && !isActive ? "text-zinc-300" : "text-zinc-600"}`}>{f}</span>
                  </li>
                ))}
                {plan.notIncluded.map(f => (
                  <li key={f} className="flex items-start gap-2 opacity-40">
                    <Icon name="remove" className="text-zinc-400 text-base flex-shrink-0 mt-0.5" />
                    <span className={`text-xs line-through leading-relaxed ${isElite && !isActive ? "text-zinc-500" : "text-zinc-400"}`}>{f}</span>
                  </li>
                ))}
              </ul>

              {isActive ? (
                <div className="w-full text-center bg-green-600 text-white font-black py-3 rounded-full text-sm">
                  Plano atual ✓
                </div>
              ) : (
                <button
                  onClick={() => subscribe(plan.key as StorePlan)}
                  disabled={!!isLoading}
                  className={`w-full font-black py-3 rounded-full text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2 ${
                    isElite ? "bg-yellow-500 text-black hover:bg-yellow-400" :
                    isPro ? "bg-zinc-900 text-white hover:bg-zinc-700" :
                    "border-2 border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  {isLoading && <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />}
                  {activePlan ? `Mudar para ${plan.name}` : `Assinar ${plan.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparativo completo */}
      <div className="mb-10">
        <h2 className="text-lg font-black text-zinc-900 mb-5">Comparativo completo</h2>
        <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-5 py-3 text-xs font-black uppercase tracking-widest text-zinc-400">Recurso</th>
                {plans.map(p => (
                  <th key={p.key} className={`px-4 py-3 text-center text-xs font-black uppercase tracking-wider ${
                    p.key === "PRO" ? "text-yellow-600" : p.key === "ELITE" ? "text-zinc-900" : "text-zinc-500"
                  }`}>
                    {p.emoji} {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {COMPARE_ROWS.map(row => (
                <tr key={row.label} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-5 py-3.5 text-zinc-700 text-sm">{row.label}</td>
                  <td className="px-4 py-3.5 text-center"><Check v={row.starter} /></td>
                  <td className="px-4 py-3.5 text-center"><Check v={row.pro} /></td>
                  <td className="px-4 py-3.5 text-center"><Check v={row.elite} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rodapé info */}
      <div className="bg-zinc-50 rounded-2xl border border-zinc-100 p-5 text-center">
        <p className="text-xs text-zinc-500 leading-relaxed">
          <Icon name="lock" className="text-zinc-400 text-sm inline mr-1" />
          Pagamento seguro via Mercado Pago · PIX, boleto ou cartão de crédito ·
          Ativação imediata após confirmação · Cancele quando quiser
        </p>
        <p className="text-xs text-zinc-400 mt-2">
          Todo lojista possui <strong>20 anúncios gratuitos</strong> por padrão. Os planos adicionam anúncios extras ao limite existente.
        </p>
      </div>
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
