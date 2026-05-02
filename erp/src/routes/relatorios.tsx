import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/erp/Layout";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios / BI — ShopMotor ERP" }] }),
  component: Page,
});

const searched = [
  { name: "Toyota Corolla", v: 8900 }, { name: "Honda Civic", v: 7600 },
  { name: "Jeep Compass", v: 6420 }, { name: "VW T-Cross", v: 5210 },
  { name: "Hyundai HB20", v: 4800 }, { name: "Honda CB 500F", v: 3400 },
];
const brands = [
  { name: "Toyota", v: 28, fill: "var(--gold)" },
  { name: "Honda", v: 24, fill: "var(--gold-deep)" },
  { name: "VW", v: 18, fill: "var(--info)" },
  { name: "Jeep", v: 16, fill: "var(--success)" },
  { name: "Outros", v: 14, fill: "var(--ink)" },
];
const cities = [
  { city: "São Paulo, SP", demand: 38 },
  { city: "Rio de Janeiro, RJ", demand: 22 },
  { city: "Belo Horizonte, MG", demand: 14 },
  { city: "Curitiba, PR", demand: 11 },
  { city: "Porto Alegre, RS", demand: 8 },
];
const origin = [
  { name: "Site", v: 62 }, { name: "Financiamento", v: 21 },
  { name: "Seguro", v: 12 }, { name: "Indicação", v: 5 },
];

function Page() {
  return (
    <Layout title="Relatórios / BI" subtitle="Inteligência de mercado e demanda">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-elegant">
          <h3 className="font-semibold mb-1">Veículos mais buscados</h3>
          <p className="text-xs text-muted-foreground mb-4">Top 6 — últimos 30 dias</p>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={searched} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={11} width={110} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="v" fill="var(--gold)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-elegant">
          <h3 className="font-semibold mb-1">Marcas mais populares</h3>
          <p className="text-xs text-muted-foreground mb-4">% do total</p>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={brands} dataKey="v" innerRadius={55} outerRadius={95} paddingAngle={3}>
                  {brands.map((b) => <Cell key={b.name} fill={b.fill} />)}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-elegant">
          <h3 className="font-semibold mb-1">Cidades com mais demanda</h3>
          <p className="text-xs text-muted-foreground mb-4">% do total de buscas</p>
          <ul className="space-y-3">
            {cities.map((c) => (
              <li key={c.city}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{c.city}</span>
                  <span className="font-bold">{c.demand}%</span>
                </div>
                <div className="mt-1.5 h-2 w-full rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-gold" style={{ width: `${c.demand * 2.5}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-elegant">
          <h3 className="font-semibold mb-1">Leads por origem</h3>
          <p className="text-xs text-muted-foreground mb-4">% do total mensal</p>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={origin}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="v" fill="var(--gold-deep)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
}
