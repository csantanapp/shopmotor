import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label, value, delta, deltaLabel, icon: Icon, accent = false,
}: {
  label: string; value: string; delta?: number; deltaLabel?: string;
  icon: React.ComponentType<{ className?: string }>; accent?: boolean;
}) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-elegant transition hover:-translate-y-0.5",
      accent && "bg-gradient-dark text-background border-transparent"
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className={cn("text-xs font-medium uppercase tracking-wider", accent ? "text-background/60" : "text-muted-foreground")}>
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          accent ? "bg-gold/20 text-gold" : "bg-accent text-gold-deep"
        )}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {delta !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span className={cn(
            "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold",
            positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
          )}>
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
          <span className={accent ? "text-background/60" : "text-muted-foreground"}>{deltaLabel}</span>
        </div>
      )}
    </div>
  );
}
