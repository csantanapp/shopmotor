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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-black/10 bg-white/90 px-6 backdrop-blur-md">
      <div className="flex flex-1 flex-col min-w-0">
        <h1 className="text-base font-black text-gray-900 leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400 leading-none mt-0.5">{subtitle}</p>}
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 rounded-xl border border-black/10 bg-gray-100 px-3 py-2 w-64">
        <Icon name="search" className="text-sm text-gray-400" />
        <input
          placeholder="Buscar veículos, leads…"
          className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
        />
      </div>

      {/* Bell */}
      <button className="relative rounded-xl border border-black/10 bg-gray-100 p-2 hover:bg-gray-200 transition">
        <Icon name="notifications" className="text-lg text-gray-500" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary-container ring-2 ring-white" />
      </button>

      {action}

      {/* User */}
      <div className="flex items-center gap-3 pl-3 border-l border-black/10">
        <div className="hidden md:flex flex-col items-end leading-none gap-0.5">
          <span className="text-sm font-black text-gray-900">{user?.name?.split(" ")[0] ?? "Usuário"}</span>
          <span className="text-[11px] text-gray-400">{store}</span>
        </div>
        <div className="h-9 w-9 rounded-full bg-primary-container flex items-center justify-center text-black font-black text-sm shadow-lg shadow-primary-container/30">
          {initials}
        </div>
      </div>
    </header>
  );
}
