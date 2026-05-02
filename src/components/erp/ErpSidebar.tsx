"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";

const items = [
  { href: "/vendas",               label: "Central de Oportunidades", icon: "target"          },
  { href: "/vendas/direcao",       label: "Dashboard de Direção",     icon: "explore"         },
  { href: "/vendas/veiculos",      label: "Veículos",                 icon: "directions_car"  },
  { href: "/vendas/leads",         label: "CRM de Leads",             icon: "group"           },
  { href: "/vendas/financiamento", label: "Financiamento",            icon: "account_balance" },
  { href: "/vendas/seguros",       label: "Seguro",                   icon: "shield"          },
  { href: "/vendas/anuncios",      label: "Impulsionamento",          icon: "rocket_launch"   },
  { href: "/vendas/monetizacao",   label: "Monetização",              icon: "payments"        },
  { href: "/vendas/relatorios",    label: "Relatórios",               icon: "bar_chart"       },
  { href: "/vendas/configuracoes", label: "Configurações",            icon: "settings"        },
];

export default function ErpSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-64 flex-col bg-[#111] border-r border-white/10">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-container shadow-lg shadow-primary-container/30">
          <Icon name="bolt" className="text-black text-xl" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-black text-white tracking-wide">ShopMotor</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-container">Vendas</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/30">
          Vender mais
        </p>
        <ul className="space-y-0.5">
          {items.map((item) => {
            const active = item.href === "/vendas"
              ? pathname === "/vendas"
              : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary-container" />
                  )}
                  <Icon name={item.icon} className={`text-lg flex-shrink-0 ${active ? "text-primary-container" : ""}`} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Plan card */}
      <div className="m-3 rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs font-black text-primary-container">Plano Elite</p>
        <p className="mt-1 text-[11px] text-white/50 leading-snug">
          Acesso completo ao sistema de vendas.
        </p>
        <Link
          href="/perfil/plano"
          className="mt-3 w-full flex items-center justify-center rounded-lg bg-primary-container text-black text-xs font-black px-3 py-2 hover:opacity-90 transition shadow-lg shadow-primary-container/20"
        >
          Ver plano
        </Link>
      </div>
    </aside>
  );
}
