import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  ativo: "bg-success/15 text-success",
  vendido: "bg-info/15 text-info",
  pausado: "bg-muted text-muted-foreground",
  novo: "bg-info/15 text-info",
  atendimento: "bg-warning/20 text-gold-deep",
  proposta: "bg-accent text-gold-deep",
  negociacao: "bg-gold/20 text-gold-deep",
  fechado: "bg-success/15 text-success",
  perdido: "bg-destructive/15 text-destructive",
  analise: "bg-warning/20 text-gold-deep",
  aprovado: "bg-success/15 text-success",
  reprovado: "bg-destructive/15 text-destructive",
  turbo: "bg-info/15 text-info",
  destaque: "bg-gold/20 text-gold-deep",
  super: "bg-gradient-gold text-ink",
  normal: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
      variants[status] ?? "bg-muted text-muted-foreground"
    )}>
      {label ?? status}
    </span>
  );
}
