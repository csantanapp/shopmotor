import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/erp/Layout";
import { KpiCard } from "@/components/erp/KpiCard";
import { PlanCard } from "@/components/erp/PlanCard";
import { DollarSign, TrendingUp, Receipt, Crown } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/monetizacao")({
  head: () => ({
    meta: [
      { title: "Monetização — ShopMotor Sales OS" },
      { name: "description", content: "Receita por canal, planos e oportunidades de upgrade." },
    ],
  }),
  component: Page,
});

const revenue = [
  { m: "Jan", v: 84 }, { m: "Fev", v: 96 }, { m: "Mar", v: 110 }, { m: "Abr", v: 128 },
  { m: "Mai", v: 142 }, { m: "Jun", v: 156 }, { m: "Jul", v: 168 }, { m: "Ago", v: 184 },
];

const split = [
  { name: "Assinaturas", value: 48, fill: "var(--gold)" },
  { name: "Impulsionamento", value: 22, fill: "var(--gold-deep)" },
  { name: "Leads financiamento", value: 14, fill: "var(--info)" },
  { name: "Leads seguro", value: 10, fill: "var(--success)" },
  { name: "Banners", value: 6, fill: "var(--ink)" },
];

function Page() {
  return (
    <Layout title="Monetização" subtitle="Visão comercial — receita por canal e planos">
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <KpiCard label="Faturamento (mês)" value="R$ 184k" delta={9} deltaLabel="vs. mês anterior" icon={DollarSign} accent />
        <KpiCard label="MRR (recorrente)" value="R$ 62k" delta={5} deltaLabel="assinaturas ativas" icon={TrendingUp} />
        <KpiCard label="Receita impulsos" value="R$ 41k" delta={18} deltaLabel="alta no mês" icon={Receipt} />
        <KpiCard label="Lojistas Pro+Elite" value="124" delta={12} deltaLabel="upgrade no mês" icon={Crown} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-elegant">
          <h3 className="font-semibold mb-1">Receita por mês</h3>
          <p className="text-xs text-muted-foreground mb-4">em milhares (R$)</p>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="v" fill="var(--gold)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-elegant">
          <h3 className="font-semibold mb-1">Receita por canal</h3>
          <p className="text-xs text-muted-foreground mb-4">% do faturamento</p>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={split} dataKey="value" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {split.map((s) => <Cell key={s.name} fill={s.fill} />)}
                </Pie>
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
        Planos para lojistas
      </h3>
      <div className="grid gap-6 md:grid-cols-3">
        <PlanCard
          name="Starter"
          tagline="Comece a vender online"
          price="R$ 199"
          features={[
            "Anúncios básicos",
            "Visibilidade padrão",
            "CRM simplificado",
            "Suporte via e-mail",
          ]}
          cta="Continuar no Starter"
        />
        <PlanCard
          name="Pro"
          tagline="Para lojistas em crescimento"
          price="R$ 499"
          highlight
          features={[
            "CRM completo de alta pressão",
            "Leads qualificados de financiamento",
            "Score de Venda em todos veículos",
            "Impulsos com 20% de desconto",
            "Suporte prioritário",
          ]}
          cta="Fazer upgrade para Pro"
        />
        <PlanCard
          name="Elite"
          tagline="Distribuição preferencial"
          price="R$ 1.299"
          features={[
            "Prioridade na distribuição de leads",
            "Inteligência avançada de demanda",
            "BI dedicado por marca e cidade",
            "Gerente de conta exclusivo",
            "API e integrações premium",
          ]}
          cta="Falar com vendas"
        />
      </div>
    </Layout>
  );
}
