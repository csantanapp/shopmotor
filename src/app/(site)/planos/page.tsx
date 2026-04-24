import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { STORE_PLANS } from "@/lib/store-plans";

const plans = [STORE_PLANS.STARTER, STORE_PLANS.PRO, STORE_PLANS.ELITE];

const COMPARE_ROWS = [
  { label: "Perfil Loja personalizado",     starter: true,  pro: true,  elite: true  },
  { label: "URL exclusiva da loja",         starter: true,  pro: true,  elite: true  },
  { label: "Vitrine de veículos",           starter: true,  pro: true,  elite: true  },
  { label: "Selo verificado",               starter: true,  pro: true,  elite: true  },
  { label: "Anúncios no total",             starter: "25",  pro: "35",  elite: "50"  },
  { label: "Destaques mensais",             starter: "2",   pro: "5",   elite: "10"  },
  { label: "Links redes sociais",           starter: false, pro: true,  elite: true  },
  { label: "Acesso e-mail + telefone lead", starter: false, pro: true,  elite: true  },
  { label: "Analytics de anúncios",        starter: false, pro: true,  elite: true  },
  { label: "Simulação financiamento",       starter: false, pro: false, elite: true  },
  { label: "Destaque na Home",             starter: false, pro: false, elite: true  },
  { label: "Lead prioritário completo",    starter: false, pro: false, elite: true  },
];

function Check({ v }: { v: boolean | string }) {
  if (typeof v === "string") return <span className="text-sm font-black text-zinc-900">{v}</span>;
  return v
    ? <Icon name="check_circle" className="text-green-500 text-xl" />
    : <Icon name="cancel" className="text-zinc-200 text-xl" />;
}

const CARD_STYLE: Record<string, string> = {
  STARTER: "border-zinc-200 bg-white",
  PRO:     "border-yellow-400 bg-white ring-4 ring-yellow-400/20 scale-[1.02]",
  ELITE:   "border-zinc-900 bg-zinc-900 text-white",
};

export const metadata = {
  title: "Planos para Lojistas — ShopMotor",
  description: "Assine o plano ideal para sua loja e venda mais veículos com o suporte completo da ShopMotor.",
};

export default function PlanosPage() {
  return (
    <div className="min-h-screen bg-zinc-50">

      {/* Hero */}
      <div className="bg-zinc-900 text-white py-20 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6">
          <Icon name="storefront" className="text-sm" /> Para lojistas
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">Sua loja no ShopMotor.<br/>Do jeito certo.</h1>
        <p className="text-zinc-400 max-w-xl mx-auto mb-8">Escolha o plano ideal e transforme seu perfil em uma mini loja completa dentro do maior portal de veículos do Brasil.</p>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-400">
          {["Sem taxa de setup", "Ativação imediata", "Cancele quando quiser", "Suporte dedicado"].map(t => (
            <span key={t} className="flex items-center gap-1.5">
              <Icon name="check_circle" className="text-yellow-500 text-base" />{t}
            </span>
          ))}
        </div>
      </div>

      {/* Planos */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map(plan => {
            const isElite = plan.key === "ELITE";
            const isPro = plan.key === "PRO";
            return (
              <div key={plan.key} className={`rounded-3xl border-2 p-8 relative transition-all ${CARD_STYLE[plan.key]}`}>
                {isPro && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-black uppercase tracking-widest px-5 py-1.5 rounded-full whitespace-nowrap shadow">
                    Mais popular
                  </div>
                )}
                {isElite && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-zinc-900 text-xs font-black uppercase tracking-widest px-5 py-1.5 rounded-full whitespace-nowrap shadow">
                    Melhor custo-benefício
                  </div>
                )}

                <div className="text-2xl mb-3">{plan.emoji}</div>
                <h2 className={`text-2xl font-black mb-1 ${isElite ? "text-white" : "text-zinc-900"}`}>{plan.name}</h2>
                <p className={`text-xs uppercase tracking-widest mb-6 ${isElite ? "text-zinc-400" : "text-zinc-400"}`}>Plano mensal · {plan.days} dias</p>

                <div className="mb-6">
                  <span className={`text-4xl font-black ${isElite ? "text-white" : "text-zinc-900"}`}>
                    {plan.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })}
                  </span>
                  <span className={`text-sm ml-1 ${isElite ? "text-zinc-400" : "text-zinc-400"}`}>/mês</span>
                </div>

                <Link
                  href={`/perfil/plano?plan=${plan.key}`}
                  className={`block w-full text-center font-black py-3.5 rounded-full text-sm uppercase tracking-widest transition-all mb-8 hover:-translate-y-0.5 ${
                    isElite
                      ? "bg-yellow-500 text-black hover:bg-yellow-400"
                      : isPro
                      ? "bg-zinc-900 text-white hover:bg-zinc-700"
                      : "border-2 border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  Assinar {plan.name}
                </Link>

                <div className="space-y-3">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-start gap-2.5">
                      <Icon name="check_circle" className="text-green-500 text-base flex-shrink-0 mt-0.5" />
                      <span className={`text-sm ${isElite ? "text-zinc-300" : "text-zinc-600"}`}>{f}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map(f => (
                    <div key={f} className="flex items-start gap-2.5 opacity-40">
                      <Icon name="remove_circle" className="text-zinc-400 text-base flex-shrink-0 mt-0.5" />
                      <span className={`text-sm line-through ${isElite ? "text-zinc-500" : "text-zinc-400"}`}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparativo completo */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-black text-zinc-900 text-center mb-8">Comparativo completo</h2>
        <div className="bg-white rounded-3xl border border-zinc-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-400">Recurso</th>
                {plans.map(p => (
                  <th key={p.key} className={`px-6 py-4 text-center text-sm font-black ${p.key === "PRO" ? "text-yellow-600" : p.key === "ELITE" ? "text-zinc-900" : "text-zinc-600"}`}>
                    {p.emoji} {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {COMPARE_ROWS.map(row => (
                <tr key={row.label} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 text-zinc-700 font-medium">{row.label}</td>
                  <td className="px-6 py-4 text-center"><Check v={row.starter} /></td>
                  <td className="px-6 py-4 text-center"><Check v={row.pro} /></td>
                  <td className="px-6 py-4 text-center"><Check v={row.elite} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Como funciona */}
      <div className="bg-white border-t border-zinc-100 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-zinc-900 text-center mb-10">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", icon: "person_add", title: "Cadastre-se", desc: "Crie sua conta como lojista (PJ) gratuitamente." },
              { step: "02", icon: "checklist", title: "Escolha o plano", desc: "Selecione o plano que melhor atende o tamanho do seu negócio." },
              { step: "03", icon: "payment", title: "Pague com segurança", desc: "PIX, boleto ou cartão — pagamento processado pelo Mercado Pago." },
              { step: "04", icon: "rocket_launch", title: "Ative e venda", desc: "Sua loja é ativada imediatamente após a confirmação do pagamento." },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                  <Icon name={s.icon} className="text-zinc-500 text-2xl" />
                  <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">{s.step}</span>
                </div>
                <h3 className="font-black text-zinc-900 mb-1">{s.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Anúncios base */}
      <div className="bg-zinc-50 border-t border-zinc-100 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Icon name="info" className="text-zinc-400 text-3xl mb-4" />
          <h3 className="text-xl font-black text-zinc-900 mb-3">Sobre os anúncios gratuitos</h3>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-xl mx-auto">
            Todo lojista cadastrado na ShopMotor já possui <strong>20 anúncios gratuitos</strong> por padrão.
            Os planos acima adicionam anúncios <strong>extras</strong> ao limite existente:
            Starter (25 total), Pro (35 total), Elite (50 total).
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-zinc-900 text-white py-16 px-4 text-center">
        <h2 className="text-3xl font-black mb-3">Comece hoje mesmo</h2>
        <p className="text-zinc-400 mb-8 max-w-md mx-auto">Sem taxa de setup. Sem contrato longo. Cancele quando quiser.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/perfil/plano?plan=PRO"
            className="bg-yellow-500 text-black font-black px-10 py-4 rounded-full text-sm uppercase tracking-widest hover:bg-yellow-400 transition-colors">
            Assinar Plano Pro
          </Link>
          <Link href="/cadastro"
            className="border border-white/20 text-white font-black px-10 py-4 rounded-full text-sm uppercase tracking-widest hover:bg-white/10 transition-colors">
            Criar conta grátis
          </Link>
        </div>
      </div>

    </div>
  );
}
