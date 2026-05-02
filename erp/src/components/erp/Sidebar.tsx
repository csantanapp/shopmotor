import { Link, useRouterState } from "@tanstack/react-router";
import {
  Target, Compass, Car, Users, Wallet, ShieldCheck, Rocket,
  DollarSign, BarChart3, Settings, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Central de Oportunidades", icon: Target },
  { to: "/direcao", label: "Dashboard de Direção", icon: Compass },
  { to: "/veiculos", label: "Veículos", icon: Car },
  { to: "/leads", label: "CRM de Leads", icon: Users },
  { to: "/financiamento", label: "Financiamento", icon: Wallet },
  { to: "/seguros", label: "Seguro", icon: ShieldCheck },
  { to: "/anuncios", label: "Impulsionamento", icon: Rocket },
  { to: "/monetizacao", label: "Monetização", icon: DollarSign },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-gold shadow-gold">
          <Zap className="h-5 w-5 text-ink" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold tracking-wide">ShopMotor</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-gold">ERP</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/40">
          Vender mais
        </p>
        <ul className="space-y-1">
          {items.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-gold" />
                  )}
                  <Icon className={cn("h-4 w-4 shrink-0", active && "text-gold")} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="m-3 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-4">
        <p className="text-xs font-semibold text-gold">Plano Pro</p>
        <p className="mt-1 text-[11px] text-sidebar-foreground/60">
          Anúncios ilimitados e BI avançado.
        </p>
        <button className="mt-3 w-full rounded-md bg-gradient-gold px-3 py-1.5 text-xs font-semibold text-ink shadow-gold transition hover:opacity-90">
          Fazer upgrade
        </button>
      </div>
    </aside>
  );
}
