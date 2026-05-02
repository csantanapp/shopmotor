import { cn } from "@/lib/utils";
import { Clock, TrendingUp, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Opportunity = {
  id: string;
  type: string;
  priority: "alta" | "media" | "baixa";
  impact: string;
  vehicle?: string;
  lead?: string;
  waitingTime?: string;
  recommendation: string;
  icon: LucideIcon;
  actions: { label: string; tone?: "primary" | "ghost" | "success"; onClick?: () => void }[];
};

const priorityStyle: Record<Opportunity["priority"], string> = {
  alta: "bg-destructive/10 text-destructive border-destructive/30",
  media: "bg-gold/15 text-gold-deep border-gold/40",
  baixa: "bg-muted text-muted-foreground border-border",
};

const priorityLabel: Record<Opportunity["priority"], string> = {
  alta: "Prioridade alta",
  media: "Prioridade média",
  baixa: "Prioridade baixa",
};

const toneStyle: Record<NonNullable<Opportunity["actions"][number]["tone"]>, string> = {
  primary: "bg-gradient-gold text-ink shadow-gold hover:opacity-90",
  success: "bg-success text-success-foreground hover:opacity-90",
  ghost: "border border-border bg-card text-foreground hover:bg-accent",
};

export function OpportunityCard({ op }: { op: Opportunity }) {
  const Icon = op.icon;
  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card p-5 shadow-elegant transition hover:-translate-y-0.5 hover:shadow-gold/20">
      {op.priority === "alta" && (
        <span className="absolute right-4 top-4 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive/60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-destructive" />
        </span>
      )}

      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-gold-deep">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", priorityStyle[op.priority])}>
            {priorityLabel[op.priority]}
          </span>
          <h3 className="mt-2 text-sm font-semibold leading-tight">{op.type}</h3>
        </div>
      </div>

      {(op.vehicle || op.lead) && (
        <div className="mt-4 space-y-1 text-xs">
          {op.vehicle && <p className="text-muted-foreground">Veículo: <span className="font-semibold text-foreground">{op.vehicle}</span></p>}
          {op.lead && <p className="text-muted-foreground">Lead: <span className="font-semibold text-foreground">{op.lead}</span></p>}
        </div>
      )}

      <div className="mt-4 rounded-lg bg-muted/50 p-3">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gold-deep">
          <Zap className="h-3 w-3" /> Ação recomendada
        </p>
        <p className="mt-1 text-sm font-semibold">{op.recommendation}</p>
      </div>

      <div className="mt-3 flex items-center gap-3 text-[11px]">
        <span className="inline-flex items-center gap-1 font-semibold text-success">
          <TrendingUp className="h-3 w-3" /> {op.impact}
        </span>
        {op.waitingTime && (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" /> {op.waitingTime}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {op.actions.map((a, i) => (
          <button
            key={i}
            onClick={a.onClick}
            className={cn(
              "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-semibold transition",
              toneStyle[a.tone ?? "primary"]
            )}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}