import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/erp/Layout";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { KpiCard } from "@/components/erp/KpiCard";
import { ShieldCheck, Clock, CheckCircle2, Car, Phone, Send, Eye } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/seguros")({
  head: () => ({ meta: [{ title: "Seguro — ShopMotor Sales OS" }] }),
  component: Page,
});

const rows = [
  { name: "Bruno Costa", car: "VW Nivus Highline", city: "São Paulo, SP", use: "Particular", broker: "Porto Seguro", revenue: 480, status: "novo" },
  { name: "Juliana Pires", car: "Honda Civic Touring", city: "São Paulo, SP", use: "Particular", broker: "SulAmérica", revenue: 620, status: "atendimento" },
  { name: "Pedro Alves", car: "Honda CB 500F", city: "Rio de Janeiro, RJ", use: "Particular", broker: "Mapfre", revenue: 240, status: "proposta" },
  { name: "Marcos Lima", car: "Jeep Compass", city: "Belo Horizonte, MG", use: "Particular", broker: "Porto Seguro", revenue: 890, status: "fechado" },
  { name: "Larissa Mota", car: "Yamaha Fazer 250", city: "Curitiba, PR", use: "Trabalho", broker: "Mapfre", revenue: 320, status: "atendimento" },
];

function Page() {
  return (
    <Layout title="Seguro" subtitle="Leads de cotação — receita extra por cada venda">
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <KpiCard label="Leads no mês" value="156" delta={11} deltaLabel="vs. mês anterior" icon={ShieldCheck} accent />
        <KpiCard label="Em atendimento" value="34" icon={Clock} />
        <KpiCard label="Fechados" value="22" delta={6} deltaLabel="conversão 14%" icon={CheckCircle2} />
        <KpiCard label="Veículos cobertos" value="98" icon={Car} />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-elegant">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left">Cliente</th>
              <th className="px-5 py-3 text-left">Veículo</th>
              <th className="px-5 py-3 text-left">Cidade</th>
              <th className="px-5 py-3 text-left">Uso</th>
              <th className="px-5 py-3 text-left">Parceiro</th>
              <th className="px-5 py-3 text-left">Potencial</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.name} className="hover:bg-muted/30">
                <td className="px-5 py-4 font-semibold">{r.name}</td>
                <td className="px-5 py-4 text-muted-foreground">{r.car}</td>
                <td className="px-5 py-4 text-xs">{r.city}</td>
                <td className="px-5 py-4 text-xs">{r.use}</td>
                <td className="px-5 py-4 text-xs">{r.broker}</td>
                <td className="px-5 py-4 font-semibold text-success">R$ {r.revenue}</td>
                <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => toast.success("Enviado para corretora")} title="Corretora" className="rounded-md bg-gradient-gold p-1.5 text-ink shadow-gold hover:opacity-90">
                      <Send className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => toast("Iniciando ligação…")} title="Ligar" className="rounded-md bg-ink p-1.5 text-background hover:opacity-90">
                      <Phone className="h-3.5 w-3.5" />
                    </button>
                    <button title="Detalhes" className="rounded-md border border-border p-1.5 hover:bg-accent">
                      <Eye className="h-3.5 w-3.5" />
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
