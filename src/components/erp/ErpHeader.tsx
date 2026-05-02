"use client";

import Icon from "@/components/ui/Icon";
import { useAuth } from "@/context/AuthContext";

export default function ErpHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const { user } = useAuth();
  const initials = user?.name?.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase() ?? "??";
  const store = (user as any)?.tradeName ?? user?.name ?? "Minha Loja";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/10 bg-[#0f0f0f]/90 px-6 backdrop-blur-md">
      <div className="flex flex-1 flex-col min-w-0">
        <h1 className="text-base font-black text-white leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-xs text-white/50 leading-none mt-0.5">{subtitle}</p>}
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 w-64">
        <Icon name="search" className="text-sm text-white/40" />
        <input
          placeholder="Buscar veículos, leads…"
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
        />
      </div>

      {/* Bell */}
      <button className="relative rounded-xl border border-white/10 bg-white/5 p-2 hover:bg-white/10 transition">
        <Icon name="notifications" className="text-lg text-white/70" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary-container ring-2 ring-[#0f0f0f]" />
      </button>

      {action}

      {/* User */}
      <div className="flex items-center gap-3 pl-3 border-l border-white/10">
        <div className="hidden md:flex flex-col items-end leading-none gap-0.5">
          <span className="text-sm font-black text-white">{user?.name?.split(" ")[0] ?? "Usuário"}</span>
          <span className="text-[11px] text-white/40">{store}</span>
        </div>
        <div className="h-9 w-9 rounded-full bg-primary-container flex items-center justify-center text-black font-black text-sm shadow-lg shadow-primary-container/30">
          {initials}
        </div>
      </div>
    </header>
  );
}
