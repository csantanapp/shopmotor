import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/erp/Layout";
import { PageAction } from "@/components/erp/Header";
import { StatusBadge } from "@/components/erp/StatusBadge";
import { VehicleWizard } from "@/components/erp/VehicleWizard";
import { Car, Eye, MousePointerClick, Zap, Filter, Search, Camera, Tag, MessageCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/veiculos")({
  head: () => ({ meta: [{ title: "Veículos — ShopMotor Sales OS" }] }),
  component: Veiculos,
});

type Vehicle = {
  id: number; name: string; brand: string; year: number; price: number; fipe: number;
  status: "ativo" | "vendido" | "pausado"; daysInStock: number;
  views: number; clicks: number; leads: number; score: number;
  scoreBreakdown: { label: string; value: number }[];
  suggestions: ("impulsionar" | "fotos" | "preco" | "responder")[];
};

const vehicles: Vehicle[] = [
  {
    id: 1, name: "Toyota Corolla XEi 2023", brand: "Toyota", year: 2023, price: 142900, fipe: 145200,
    status: "ativo", daysInStock: 12, views: 4210, clicks: 312, leads: 38, score: 92,
    scoreBreakdown: [
      { label: "Interesse", value: 95 }, { label: "Engajamento", value: 88 },
      { label: "Preço vs FIPE", value: 96 }, { label: "Qualidade do anúncio", value: 90 },
      { label: "Atendimento", value: 89 },
    ],
    suggestions: ["impulsionar"],
  },
  {
    id: 2, name: "Jeep Compass Limited 2024", brand: "Jeep", year: 2024, price: 198500, fipe: 201000,
    status: "ativo", daysInStock: 9, views: 3890, clicks: 270, leads: 31, score: 86,
    scoreBreakdown: [
      { label: "Interesse", value: 88 }, { label: "Engajamento", value: 82 },
      { label: "Preço vs FIPE", value: 92 }, { label: "Qualidade do anúncio", value: 85 },
      { label: "Atendimento", value: 83 },
    ],
    suggestions: ["impulsionar", "responder"],
  },
  {
    id: 3, name: "Honda Civic Touring 2022", brand: "Honda", year: 2022, price: 154000, fipe: 151000,
    status: "ativo", daysInStock: 21, views: 3120, clicks: 218, leads: 24, score: 74,
    scoreBreakdown: [
      { label: "Interesse", value: 80 }, { label: "Engajamento", value: 72 },
      { label: "Preço vs FIPE", value: 65 }, { label: "Qualidade do anúncio", value: 80 },
      { label: "Atendimento", value: 73 },
    ],
    suggestions: ["preco", "fotos"],
  },
  {
    id: 4, name: "VW T-Cross Highline 2023", brand: "VW", year: 2023, price: 138900, fipe: 134500,
    status: "pausado", daysInStock: 45, views: 870, clicks: 41, leads: 4, score: 32,
    scoreBreakdown: [
      { label: "Interesse", value: 30 }, { label: "Engajamento", value: 22 },
      { label: "Preço vs FIPE", value: 48 }, { label: "Qualidade do anúncio", value: 35 },
      { label: "Atendimento", value: 25 },
    ],
    suggestions: ["preco", "fotos", "impulsionar"],
  },
  {
    id: 5, name: "Hyundai HB20 Sense 2022", brand: "Hyundai", year: 2022, price: 78900, fipe: 76200,
    status: "vendido", daysInStock: 18, views: 5210, clicks: 410, leads: 52, score: 100,
    scoreBreakdown: [
      { label: "Interesse", value: 100 }, { label: "Engajamento", value: 100 },
      { label: "Preço vs FIPE", value: 100 }, { label: "Qualidade do anúncio", value: 100 },
      { label: "Atendimento", value: 100 },
    ],
    suggestions: [],
  },
  {
    id: 6, name: "Honda CB 500F 2024", brand: "Honda", year: 2024, price: 42500, fipe: 43800,
    status: "ativo", daysInStock: 7, views: 2110, clicks: 188, leads: 19, score: 78,
    scoreBreakdown: [
      { label: "Interesse", value: 82 }, { label: "Engajamento", value: 78 },
      { label: "Preço vs FIPE", value: 88 }, { label: "Qualidade do anúncio", value: 70 },
      { label: "Atendimento", value: 72 },
    ],
    suggestions: ["fotos"],
  },
];

const scoreLabel = (s: number) =>
  s >= 80 ? { label: "Alta chance de venda", tone: "bg-success/15 text-success border-success/30" }
  : s >= 60 ? { label: "Média chance", tone: "bg-gold/15 text-gold-deep border-gold/40" }
  : { label: "Baixa chance", tone: "bg-destructive/10 text-destructive border-destructive/30" };

const suggestionMap = {
  impulsionar: { label: "Impulsionar", icon: Zap, action: () => toast.success("Veículo impulsionado por 7 dias") },
  fotos: { label: "Melhorar fotos", icon: Camera, action: () => toast("Abrindo editor de fotos") },
  preco: { label: "Ajustar preço", icon: Tag, action: () => toast.success("Sugestão de preço aplicada") },
  responder: { label: "Responder leads", icon: MessageCircle, action: () => toast("Abrindo CRM") },
} as const;

function Veiculos() {
  const [open, setOpen] = useState(false);
  return (
    <Layout
      title="Gestão de Veículos"
      subtitle={`${vehicles.length} veículos · sistema sugere ações para vender mais rápido`}
      action={<PageAction variant="gold" onClick={() => setOpen(true)}>Cadastrar veículo</PageAction>}
    >
      <VehicleWizard open={open} onClose={() => setOpen(false)} />
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 flex-1 min-w-64">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Buscar por modelo, marca, placa…" className="flex-1 bg-transparent text-sm outline-none" />
        </div>
        {["Marca", "Status", "Score"].map((f) => (
          <button key={f} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-accent">
            <Filter className="h-3.5 w-3.5" /> {f}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-info/30 bg-info/5 p-4 mb-6 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-info shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold">Anúncios com mais fotos tendem a converter melhor</p>
          <p className="text-xs text-muted-foreground">Veículos com 8+ fotos recebem em média 2,3x mais contatos.</p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {vehicles.map((v) => {
          const sl = scoreLabel(v.score);
          return (
            <div key={v.id} className="rounded-xl border border-border bg-card p-5 shadow-elegant flex flex-col">
              <div className="flex items-start gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-dark text-gold">
                  <Car className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={v.status} />
                    <span className="text-[11px] text-muted-foreground">{v.daysInStock}d em estoque</span>
                  </div>
                  <h3 className="font-semibold truncate">{v.name}</h3>
                  <p className="text-xs text-muted-foreground">{v.brand} · {v.year}</p>
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <p className="text-xl font-bold">R$ {v.price.toLocaleString("pt-BR")}</p>
                <p className="text-[11px] text-muted-foreground">FIPE R$ {v.fipe.toLocaleString("pt-BR")}</p>
              </div>

              <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Score de venda</p>
                  <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", sl.tone)}>
                    {sl.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{v.score}</span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-background">
                  <div className="h-full rounded-full bg-gradient-gold" style={{ width: `${v.score}%` }} />
                </div>
                <ul className="mt-3 space-y-1.5">
                  {v.scoreBreakdown.map((b) => (
                    <li key={b.label} className="flex items-center gap-2 text-[11px]">
                      <span className="w-32 text-muted-foreground">{b.label}</span>
                      <div className="h-1 flex-1 rounded-full bg-background">
                        <div className="h-full rounded-full bg-gold-deep" style={{ width: `${b.value}%` }} />
                      </div>
                      <span className="w-7 text-right font-semibold">{b.value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-muted/50 py-2">
                  <Eye className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                  <p className="mt-0.5 text-sm font-bold">{v.views}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Views</p>
                </div>
                <div className="rounded-md bg-muted/50 py-2">
                  <MousePointerClick className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                  <p className="mt-0.5 text-sm font-bold">{v.clicks}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Cliques</p>
                </div>
                <div className="rounded-md bg-muted/50 py-2">
                  <MessageCircle className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                  <p className="mt-0.5 text-sm font-bold">{v.leads}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Leads</p>
                </div>
              </div>

              {v.suggestions.length > 0 && (
                <div className="mt-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gold-deep mb-2">Sugestões automáticas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {v.suggestions.map((s) => {
                      const sg = suggestionMap[s];
                      const Icon = sg.icon;
                      return (
                        <button
                          key={s}
                          onClick={sg.action}
                          className="inline-flex items-center gap-1 rounded-md bg-gradient-gold px-2.5 py-1 text-[11px] font-semibold text-ink shadow-gold hover:opacity-90"
                        >
                          <Icon className="h-3 w-3" /> {sg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
