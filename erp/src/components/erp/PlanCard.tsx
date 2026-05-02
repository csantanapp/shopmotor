import { Check, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlanCard({
  name, price, tagline, features, highlight = false, cta = "Selecionar plano",
}: {
  name: string; price: string; tagline: string;
  features: string[]; highlight?: boolean; cta?: string;
}) {
  return (
    <div className={cn(
      "relative flex flex-col rounded-2xl border p-6 shadow-elegant transition",
      highlight
        ? "border-gold/50 bg-gradient-dark text-background"
        : "border-border bg-card"
    )}>
      {highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-gradient-gold px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink shadow-gold">
          <Crown className="h-3 w-3" /> Mais vendido
        </span>
      )}
      <div>
        <p className={cn("text-xs font-bold uppercase tracking-[0.2em]", highlight ? "text-gold" : "text-gold-deep")}>
          {name}
        </p>
        <p className={cn("mt-1 text-xs", highlight ? "text-background/60" : "text-muted-foreground")}>{tagline}</p>
      </div>
      <p className="mt-4 text-3xl font-bold">{price}<span className={cn("text-sm font-normal", highlight ? "text-background/60" : "text-muted-foreground")}>/mês</span></p>
      <ul className="mt-5 space-y-2.5 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className={cn("h-4 w-4 shrink-0 mt-0.5", highlight ? "text-gold" : "text-success")} />
            <span className={highlight ? "text-background/85" : ""}>{f}</span>
          </li>
        ))}
      </ul>
      <button className={cn(
        "mt-6 w-full rounded-lg py-2.5 text-sm font-bold transition",
        highlight
          ? "bg-gradient-gold text-ink shadow-gold hover:opacity-90"
          : "bg-ink text-background hover:opacity-90"
      )}>
        {cta}
      </button>
    </div>
  );
}