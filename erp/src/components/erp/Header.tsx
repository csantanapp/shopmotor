import { Bell, Search, Plus } from "lucide-react";

export function Header({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <div className="flex flex-1 items-center gap-4">
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 w-72">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Buscar veículos, leads…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <button className="relative rounded-lg border border-border bg-card p-2 hover:bg-accent transition">
        <Bell className="h-4 w-4" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold ring-2 ring-card" />
      </button>

      {action}

      <div className="flex items-center gap-3 pl-3 border-l border-border">
        <div className="hidden md:flex flex-col items-end leading-tight">
          <span className="text-sm font-semibold">Carlos Mendes</span>
          <span className="text-[11px] text-muted-foreground">AutoPrime Motors</span>
        </div>
        <div className="h-9 w-9 rounded-full bg-gradient-gold flex items-center justify-center text-ink font-bold shadow-gold">
          CM
        </div>
      </div>
    </header>
  );
}

export function PageAction({
  children,
  icon: Icon = Plus,
  onClick,
  variant = "ink",
}: {
  children: React.ReactNode;
  icon?: typeof Plus;
  onClick?: () => void;
  variant?: "ink" | "gold";
}) {
  const cls =
    variant === "gold"
      ? "bg-gradient-gold text-ink shadow-gold"
      : "bg-ink text-background shadow-elegant";
  return (
    <button
      onClick={onClick}
      className={`hidden md:inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold hover:opacity-90 transition ${cls}`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}
