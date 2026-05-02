import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/erp/Layout";
import { KpiCard } from "@/components/erp/KpiCard";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { Flame, TrendingUp, Clock, Car, DollarSign, Eye, Target } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, LineChart, Line,
} from "recharts";

export const Route = createFileRoute("/direcao")({
  head: () => ({
    meta: [
      { title: "Dashboard de Direção — ShopMotor Sales OS" },
      { name: "description", content: "Você pode vender 7 veículos esta semana. Veja como." },
    ],
  }),
  component: Direcao,
});

const leadsData = [
  { d: "Seg", leads: 24 }, { d: "Ter", leads: 31 }, { d: "Qua", leads: 28 },
  { d: "Qui", leads: 42 }, { d: "Sex", leads: 51 }, { d: "Sáb", leads: 67 }, { d: "Dom", leads: 45 },
];

const conversion = [
  { source: "Site", v: 38 }, { source: "Financiamento", v: 52 },
  { source: "Seguro", v: 31 }, { source: "Indicação", v: 64 },
];

const adsPerf = [
  { name: "Normal", v: 1240 }, { name: "Turbo", v: 3210 },
  { name: "Destaque", v: 5430 }, { name: "Super", v: 8900 },
];

const potential = [
  { cat: "SUV", v: 480 }, { cat: "Sedan", v: 320 },
  { cat: "Hatch", v: 210 }, { cat: "Pickup", v: 380 }, { cat: "Moto", v: 140 },
];

function Direcao() {
  return (
    <Layout title="Dashboard de Direção" subtitle="Sua semana de vendas em uma tela">
      <section className="rounded-2xl border border-gold/30 bg-gradient-dark p-6 md:p-8 text-background shadow-elegant">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-gold">
          <Target className="h-3 w-3" /> Previsão de vendas
        </span>
        <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
          Você pode vender <span className="text-gradient-gold">7 veículos</span> esta semana
        </h2>
        <p className="mt-2 text-sm text-background/70">
          Combinando leads quentes, anúncios em alta e ajustes de preço sugeridos.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[
            { n: "3", t: "Leads prontos para fechamento", c: "text-success" },
            { n: "2", t: "Veículos precisam ajuste de preço", c: "text-gold" },
            { n: "2", t: "Anúncios para impulsionar", c: "text-info" },
            { n: "5", t: "Leads precisam resposta rápida", c: "text-destructive" },
          ].map((b) => (
            <div key={b.t} className="rounded-xl border border-background/10 bg-background/5 p-4">
              <p className={`text-3xl font-bold ${b.c}`}>{b.n}</p>
              <p className="mt-1 text-xs text-background/70">{b.t}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Leads quentes" value="14" delta={28} deltaLabel="vs. semana" icon={Flame} accent />
        <KpiCard label="Vendas previstas" value="7" delta={17} deltaLabel="esta semana" icon={Target} />
        <KpiCard label="Tempo médio resposta" value="6 min" delta={-22} deltaLabel="melhorou" icon={Clock} />
        <KpiCard label="Veículos alta chance" value="11" delta={9} deltaLabel="score 80+" icon={Car} />
        <KpiCard label="Receita potencial" value="R$ 1,4M" delta={12} deltaLabel="próx. 7 dias" icon={DollarSign} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-elegant">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Leads por dia</h3>
              <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
            </div>
            <span className="text-xs font-semibold text-success">+18% semana</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={leadsData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="leads" stroke="var(--gold-deep)" strokeWidth={2.5} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-elegant">
          <h3 className="font-semibold">Conversão por origem</h3>
          <p className="text-xs text-muted-foreground mb-4">% leads → venda</p>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={conversion} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis type="category" dataKey="source" stroke="var(--muted-foreground)" fontSize={11} width={100} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="v" fill="var(--gold)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-elegant">
          <h3 className="font-semibold">Performance dos anúncios</h3>
          <p className="text-xs text-muted-foreground mb-4">Visualizações por tipo de plano</p>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={adsPerf}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="v" fill="var(--gold)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-elegant">
          <h3 className="font-semibold">Receita potencial por categoria</h3>
          <p className="text-xs text-muted-foreground mb-4">em milhares (R$)</p>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={potential}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="cat" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="v" stroke="var(--gold-deep)" strokeWidth={3} dot={{ r: 5, fill: "var(--gold)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-elegant">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Veículos mais visualizados</h3>
            <p className="text-xs text-muted-foreground">Aproveite o pico de interesse</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-gold/15 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-gold-deep">
            <TrendingUp className="h-3 w-3" /> Hot
          </span>
        </div>
        <ul className="divide-y divide-border">
          {[
            { name: "Toyota Corolla XEi 2023", views: 4210, contacts: 84, status: "ativo" },
            { name: "Jeep Compass Limited 2024", views: 3890, contacts: 71, status: "ativo" },
            { name: "Honda Civic Touring 2022", views: 3120, contacts: 58, status: "ativo" },
            { name: "VW T-Cross Highline 2023", views: 2870, contacts: 49, status: "ativo" },
          ].map((c, i) => (
            <li key={c.name} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-xs font-bold text-gold-deep">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Eye className="h-3 w-3" /> {c.views.toLocaleString("pt-BR")} views · {c.contacts} contatos
                  </p>
                </div>
              </div>
              <StatusBadge status={c.status} />
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
