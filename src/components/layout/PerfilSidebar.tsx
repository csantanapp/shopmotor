"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { icon: "directions_car", label: "Cadastrar meu veículo", href: "/perfil/cadastrar" },
  { icon: "list_alt",        label: "Meus anúncios",        href: "/perfil/meus-anuncios" },
  { icon: "chat_bubble",     label: "Mensagens",            href: "/perfil/mensagens" },
  { icon: "favorite",        label: "Favoritos",            href: "/perfil/favoritos" },
  { icon: "person",          label: "Minha conta",          href: "/perfil/conta" },
  { icon: "help",            label: "Ajuda",                href: "/perfil/ajuda" },
];

export default function PerfilSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const planLabel = user?.plan === "PREMIUM" ? "Vendedor Premium" : "Plano Grátis";

  return (
    <aside className="hidden md:flex flex-col w-64 sticky top-[80px] h-[calc(100vh-80px)] bg-neutral-100 border-r border-neutral-200 p-4 flex-shrink-0">
      {/* User */}
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary-fixed flex-shrink-0 bg-surface-container flex items-center justify-center">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl font-black text-on-surface-variant">
              {user?.name?.charAt(0).toUpperCase() ?? "?"}
            </span>
          )}
        </div>
        <Link href="/perfil" className="overflow-hidden hover:opacity-80 transition-opacity">
          <h3 className="text-neutral-900 font-bold leading-tight text-sm truncate">{user?.accountType === "PJ" ? (user.tradeName || user.name) : user?.name ?? "..."}</h3>
          <p className="text-xs text-neutral-500">{planLabel}</p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-white text-yellow-600 font-bold shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-200 hover:translate-x-1"
              }`}
            >
              <Icon name={item.icon} className="text-lg" />
              {item.label}
            </Link>
          );
        })}
        {user?.accountType === "PJ" && (
          <Link
            href="/perfil/loja"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              pathname === "/perfil/loja"
                ? "bg-white text-yellow-600 font-bold shadow-sm"
                : "text-neutral-600 hover:bg-neutral-200 hover:translate-x-1"
            }`}
          >
            <Icon name="storefront" className="text-lg" />
            Minha loja
          </Link>
        )}
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        className="mt-4 w-full bg-neutral-900 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-bold text-sm transition-transform active:scale-95 hover:bg-neutral-700"
      >
        <Icon name="logout" className="text-sm" />
        Sair
      </button>
    </aside>
  );
}
