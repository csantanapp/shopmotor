import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/erp/Layout";
import { Crown, Check, MessageCircle, Plug, Building2 } from "lucide-react";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — ShopMotor ERP" }] }),
  component: Page,
});

function Page() {
  return (
    <Layout title="Perfil / Configurações" subtitle="Dados do lojista, plano e integrações">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-elegant">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-gold text-ink shadow-gold">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold">AutoPrime Motors</h2>
              <p className="text-sm text-muted-foreground">Lojista verificado · São Paulo, SP</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["Razão social", "AutoPrime Veículos LTDA"],
              ["CNPJ", "12.345.678/0001-90"],
              ["E-mail", "contato@autoprime.com.br"],
              ["Telefone", "(11) 4002-8922"],
              ["Cidade", "São Paulo, SP"],
              ["Responsável", "Carlos Mendes"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
                <input defaultValue={value} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold" />
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-accent">Cancelar</button>
            <button className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-background hover:opacity-90">Salvar alterações</button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gold/40 bg-gradient-dark p-6 text-background shadow-gold">
            <div className="flex items-center gap-2 text-gold">
              <Crown className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Plano Pro</span>
            </div>
            <p className="mt-3 text-2xl font-bold">R$ 499<span className="text-sm font-normal text-background/60">/mês</span></p>
            <ul className="mt-4 space-y-2 text-sm">
              {["Anúncios ilimitados", "BI avançado", "CRM completo", "Suporte prioritário"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-background/85">
                  <Check className="h-4 w-4 text-gold" /> {f}
                </li>
              ))}
            </ul>
            <button className="mt-5 w-full rounded-lg bg-gradient-gold py-2 text-sm font-bold text-ink hover:opacity-90">
              Fazer upgrade para Premium
            </button>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-elegant">
            <h3 className="font-semibold flex items-center gap-2"><Plug className="h-4 w-4" /> Integrações</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-success" /> WhatsApp Business</span>
                <span className="rounded-full bg-success/15 text-success px-2 py-0.5 text-[11px] font-semibold">Conectado</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Mercado Pago</span>
                <button className="text-xs font-semibold text-gold-deep hover:underline">Conectar</button>
              </li>
              <li className="flex items-center justify-between">
                <span>Webmotors API</span>
                <button className="text-xs font-semibold text-gold-deep hover:underline">Conectar</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}
