import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/erp/Layout";
import { PageAction } from "@/components/erp/Header";
import { LeadChatPanel, type ChatLead } from "@/components/erp/LeadChatPanel";
import { Phone, MessageCircle, Globe, Wallet, ShieldCheck, Flame, Snowflake, Thermometer, Eye, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/leads")({
  head: () => ({ meta: [{ title: "CRM de Alta Pressão — ShopMotor Sales OS" }] }),
  component: Leads,
});

type Temp = "quente" | "morno" | "frio";
type Lead = {
  name: string; phone: string; car: string;
  origin: "site" | "financiamento" | "seguro";
  temp: Temp; lastContact: string; probability: number; alert?: string;
};
type Col = { key: string; title: string; tone: string; leads: Lead[] };

const columns: Col[] = [
  { key: "novo", title: "Novo lead", tone: "bg-info", leads: [
    { name: "Rafael Souza", phone: "(11) 9 8800-1122", car: "Toyota Corolla 2023", origin: "site", temp: "quente", lastContact: "há 18 min", probability: 78, alert: "Lead ativo agora no site" },
    { name: "Pedro Alves", phone: "(21) 9 9911-3344", car: "Honda CB 500F", origin: "site", temp: "morno", lastContact: "há 2h", probability: 52 },
    { name: "Larissa Mota", phone: "(31) 9 9001-2233", car: "Jeep Renegade", origin: "financiamento", temp: "quente", lastContact: "há 35 min", probability: 71, alert: "Simulou financiamento" },
  ]},
  { key: "atendimento", title: "Em atendimento", tone: "bg-warning", leads: [
    { name: "Juliana Pires", phone: "(11) 9 7766-5544", car: "Honda Civic Touring", origin: "site", temp: "quente", lastContact: "há 12 min", probability: 82, alert: "Abriu o anúncio novamente" },
    { name: "Bruno Costa", phone: "(41) 9 8123-4455", car: "VW Nivus", origin: "seguro", temp: "morno", lastContact: "há 4h", probability: 48 },
  ]},
  { key: "proposta", title: "Proposta enviada", tone: "bg-gold-soft", leads: [
    { name: "Marcos Lima", phone: "(11) 9 6543-2211", car: "Jeep Compass Limited", origin: "financiamento", temp: "quente", lastContact: "há 42 min", probability: 88, alert: "Responder em até 3 minutos" },
  ]},
  { key: "negociacao", title: "Negociação", tone: "bg-gold", leads: [
    { name: "Ana Beatriz", phone: "(11) 9 4321-1100", car: "VW T-Cross Highline", origin: "site", temp: "quente", lastContact: "há 1h", probability: 91, alert: "Alta intenção de compra" },
    { name: "Fábio Reis", phone: "(11) 9 8765-4321", car: "Hyundai HB20", origin: "site", temp: "morno", lastContact: "há 1 dia", probability: 55 },
  ]},
  { key: "fechado", title: "Fechado / Perdido", tone: "bg-success", leads: [
    { name: "Camila Faria", phone: "(11) 9 1122-3344", car: "Honda Fit", origin: "site", temp: "frio", lastContact: "há 5 dias", probability: 100 },
  ]},
];

const originIcon = { site: Globe, financiamento: Wallet, seguro: ShieldCheck };
const tempIcon: Record<Temp, typeof Flame> = { quente: Flame, morno: Thermometer, frio: Snowflake };
const tempStyle: Record<Temp, string> = {
  quente: "bg-destructive/10 text-destructive border-destructive/30",
  morno: "bg-gold/15 text-gold-deep border-gold/40",
  frio: "bg-info/10 text-info border-info/30",
};

function Leads() {
  const [active, setActive] = useState<ChatLead | null>(null);
  // sort each column by probability desc (priority)
  const sorted = columns.map((c) => ({
    ...c,
    leads: [...c.leads].sort((a, b) => b.probability - a.probability),
  }));

  return (
    <Layout
      title="CRM de Alta Pressão"
      subtitle="Responda primeiro os leads com maior chance de compra"
      action={<PageAction>Novo lead</PageAction>}
    >
      <LeadChatPanel lead={active} onClose={() => setActive(null)} />
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 mb-6 flex items-start gap-3">
        <Flame className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold">Tempo de resposta é um dos maiores fatores de conversão</p>
          <p className="text-xs text-muted-foreground">Você tem <span className="font-bold text-destructive">3 leads quentes</span> esperando há mais de 15 minutos.</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
        {sorted.map((col) => (
          <div key={col.key} className="rounded-xl border border-border bg-muted/30 p-3">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${col.tone}`} />
                <h3 className="text-sm font-semibold">{col.title}</h3>
              </div>
              <span className="text-xs font-bold text-muted-foreground">{col.leads.length}</span>
            </div>
            <div className="space-y-2.5">
              {col.leads.map((l) => {
                const Origin = originIcon[l.origin];
                const Temp = tempIcon[l.temp];
                return (
                  <div
                    key={l.name}
                    onClick={() => setActive(l)}
                    className="cursor-pointer rounded-lg border border-border bg-card p-3 shadow-sm hover:shadow-elegant hover:border-gold/40 transition"
                  >
                    {l.alert && (
                      <div className="mb-2 flex items-center gap-1.5 rounded-md bg-destructive/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-destructive">
                        <Eye className="h-3 w-3" /> {l.alert}
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{l.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{l.car}</p>
                      </div>
                      <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-bold uppercase", tempStyle[l.temp])}>
                        <Temp className="h-2.5 w-2.5" /> {l.temp}
                      </span>
                    </div>

                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-[10px] mb-0.5">
                        <span className="text-muted-foreground">Probabilidade fechamento</span>
                        <span className="font-bold">{l.probability}%</span>
                      </div>
                      <div className="h-1 w-full rounded-full bg-muted">
                        <div className="h-full rounded-full bg-gradient-gold" style={{ width: `${l.probability}%` }} />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Origin className="h-3 w-3" /> {l.origin}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{l.lastContact}</span>
                    </div>

                    <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                      <button onClick={(e) => { e.stopPropagation(); toast("Iniciando ligação…"); }} className="inline-flex items-center justify-center gap-1 rounded-md bg-ink px-1 py-1.5 text-[10px] font-semibold text-background hover:opacity-90">
                        <Phone className="h-3 w-3" /> Ligar
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); toast.success(`WhatsApp aberto: ${l.name}`); }} className="inline-flex items-center justify-center gap-1 rounded-md bg-success text-success-foreground px-1 py-1.5 text-[10px] font-semibold hover:opacity-90">
                        <MessageCircle className="h-3 w-3" /> Wpp
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); toast.success("Lead movido para próxima etapa"); }} className="inline-flex items-center justify-center gap-1 rounded-md border border-border bg-card px-1 py-1.5 text-[10px] font-semibold hover:bg-accent">
                        Mover <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
