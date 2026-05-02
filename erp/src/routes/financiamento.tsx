import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/erp/Layout";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { KpiCard } from "@/components/erp/KpiCard";
import { SalesInsightCard } from "@/components/erp/SalesInsightCard";
import { Wallet, CheckCircle2, Clock, XCircle, MessageCircle, FileSignature, Share2, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/financiamento")({
  head: () => ({ meta: [{ title: "Financiamento — ShopMotor Sales OS" }] }),
  component: Page,
});

const rows = [
  { name: "Rafael Souza", car: "Toyota Corolla 2023", value: 142900, down: 30000, term: 60, parcel: 2980, status: "novo", chance: 82 },
  { name: "Marcos Lima", car: "Jeep Compass Limited", value: 198500, down: 50000, term: 60, parcel: 4120, status: "analise", chance: 78 },
  { name: "Larissa Mota", car: "Jeep Renegade Sport", value: 119000, down: 25000, term: 48, parcel: 2480, status: "aprovado", chance: 91 },
  { name: "Bruno Costa", car: "VW Nivus Highline", value: 132500, down: 28000, term: 60, parcel: 2750, status: "analise", chance: 64 },
  { name: "Camila Faria", car: "Honda Fit EXL", value: 89900, down: 15000, term: 60, parcel: 1880, status: "reprovado", chance: 18 },
  { name: "Ana Beatriz", car: "VW T-Cross", value: 138900, down: 35000, term: 48, parcel: 2890, status: "aprovado", chance: 88 },
];

const chanceTone = (c: number) =>
  c >= 75 ? "bg-success/15 text-success" : c >= 50 ? "bg-gold/15 text-gold-deep" : "bg-destructive/10 text-destructive";

function Page() {
  return (
    <Layout title="Financiamento" subtitle="Leads de financiamento são oportunidades de alta intenção">
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <KpiCard label="Novos" value="12" icon={Wallet} />
        <KpiCard label="Em análise" value="28" icon={Clock} />
        <KpiCard label="Aprovados" value="41" delta={14} deltaLabel="este mês" icon={CheckCircle2} accent />
        <KpiCard label="Reprovados" value="9" icon={XCircle} />
      </div>

      <div className="mb-6">
        <SalesInsightCard
          icon={Flame}
          tone="gold"
          title="Cliente que simula financiamento tem 3x mais chance de fechar"
          description="Priorize esses leads e envie a proposta em até 1 hora."
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-elegant">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left">Cliente</th>
              <th className="px-5 py-3 text-left">Veículo</th>
              <th className="px-5 py-3 text-left">Valor</th>
              <th className="px-5 py-3 text-left">Entrada / Prazo</th>
              <th className="px-5 py-3 text-left">Parcela</th>
              <th className="px-5 py-3 text-left">Chance compra</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.name} className="hover:bg-muted/30">
                <td className="px-5 py-4 font-semibold">{r.name}</td>
                <td className="px-5 py-4 text-muted-foreground">{r.car}</td>
                <td className="px-5 py-4 font-semibold">R$ {r.value.toLocaleString("pt-BR")}</td>
                <td className="px-5 py-4 text-xs">R$ {r.down.toLocaleString("pt-BR")} · {r.term}x</td>
                <td className="px-5 py-4">R$ {r.parcel.toLocaleString("pt-BR")}</td>
                <td className="px-5 py-4">
                  <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-bold", chanceTone(r.chance))}>
                    {r.chance}%
                  </span>
                </td>
                <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => toast.success(`Proposta enviada a ${r.name}`)} title="Enviar proposta" className="rounded-md bg-gradient-gold p-1.5 text-ink shadow-gold hover:opacity-90">
                      <FileSignature className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => toast(`WhatsApp: ${r.name}`)} title="WhatsApp" className="rounded-md bg-success p-1.5 text-success-foreground hover:opacity-90">
                      <MessageCircle className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => toast("Encaminhado ao parceiro")} title="Parceiro" className="rounded-md border border-border p-1.5 hover:bg-accent">
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
