"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Comprar",       href: "/busca" },
  { label: "Vender",        href: "/perfil/cadastrar" },
  { label: "Financiamento", href: "/financiamento" },
  { label: "Seguros",       href: "/seguros" },
];

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [unread, setUnread] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    if (!user) { setUnread(0); return; }

    const check = () =>
      fetch("/api/notifications/unread")
        .then(r => r.json())
        .then(d => setUnread(d.count ?? 0))
        .catch(() => {});

    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <header className="bg-zinc-950/90 backdrop-blur-md sticky top-0 z-50 shadow-2xl">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto">
        <Link href="/" className="text-2xl font-black tracking-tighter text-white uppercase font-headline">
          SHOPMOTOR
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          {NAV_LINKS.map(({ label, href }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container rounded-sm ${
                  active
                    ? "text-yellow-500 border-b-2 border-yellow-500 pb-1"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/perfil/favoritos"
            aria-label="Favoritos"
            className="text-white hover:bg-white/5 p-2 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:outline-none"
          >
            <Icon name="favorite" />
          </Link>

          {/* Sino de notificações — apenas logado */}
          {!loading && user && (
            <Link
              href="/perfil/notificacoes"
              aria-label={unread > 0 ? `${unread} notificações não lidas` : "Notificações"}
              className="relative text-white hover:bg-white/5 p-2 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:outline-none"
            >
              <Icon name="notifications" className="text-xl" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-0.5 leading-none">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          )}

          {!loading && !user && (
            <>
              <Link
                href="/cadastro"
                className="hidden md:block text-white text-sm font-semibold hover:text-yellow-400 transition-colors"
              >
                Cadastrar
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <Icon name="person" fill className="text-white" />
                <span className="text-white text-sm font-medium">Login</span>
              </Link>
            </>
          )}

          {!loading && user && (
            <div className="flex items-center gap-2">
              <Link
                href="/perfil"
                className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full hover:bg-white/20 transition-colors max-w-[160px]"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-xs font-bold flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="text-white text-sm font-medium truncate hidden md:block">
                  {user.name.split(" ")[0]}
                </span>
              </Link>
              <button
                onClick={logout}
                aria-label="Sair"
                className="text-zinc-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <Icon name="logout" className="text-lg" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
