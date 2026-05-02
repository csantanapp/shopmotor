import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SalesInsightCard({
  icon: Icon, title, description, tone = "default",
}: {
  icon: LucideIcon; title: string; description: string;
  tone?: "default" | "gold" | "success" | "info";
}) {
  const tones = {
    default: "bg-card border-border",
    gold: "bg-gradient-dark text-background border-transparent",
    success: "bg-success/5 border-success/30",
    info: "bg-info/5 border-info/30",
  } as const;
  const iconTones = {
    default: "bg-accent text-gold-deep",
    gold: "bg-gold/20 text-gold",
    success: "bg-success/15 text-success",
    info: "bg-info/15 text-info",
  } as const;
  return (
    <div className={cn("flex items-start gap-3 rounded-xl border p-4 shadow-elegant", tones[tone])}>
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", iconTones[tone])}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold leading-tight">{title}</p>
        <p className={cn("mt-0.5 text-xs", tone === "gold" ? "text-background/70" : "text-muted-foreground")}>
          {description}
        </p>
      </div>
    </div>
  );
}