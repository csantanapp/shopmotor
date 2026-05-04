"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/context/AuthContext";

interface Notif {
  id: string;
  type: "lead_novo" | "mensagem" | "lead_frio";
  title: string;
  body: string;
  href: string;
  createdAt: string;
  read: boolean;
}

const typeIcon: Record<string, string> = {
  mensagem:   "chat",
  lead_novo:  "person_add",
  lead_frio:  "schedule",
};

const typeDot: Record<string, string> = {
  mensagem:  "bg-red-500",
  lead_novo: "bg-blue-500",
  lead_frio: "bg-yellow-500",
};

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

  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fetch on mount and every 60s
  useEffect(() => {
    function fetchNotifs() {
      fetch("/api/vendas/notificacoes")
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (!d) return;
          setNotifs(d.notifications ?? []);
          setUnread(d.unreadCount ?? 0);
          setLoaded(true);
        })
        .catch(() => {});
    }
    fetchNotifs();
    const t = setInterval(fetchNotifs, 60_000);
    return () => clearInterval(t);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleOpen() {
    setOpen(o => !o);
    if (!open) setUnread(0); // mark as seen when opening
  }

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
      <div className="relative" ref={ref}>
        <button
          onClick={handleOpen}
          className="relative rounded-xl border border-black/10 bg-gray-100 p-2 hover:bg-gray-200 transition"
        >
          <Icon name="notifications" className="text-lg text-gray-500" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
          {unread === 0 && loaded && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gray-300 ring-2 ring-white" />
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-12 w-80 rounded-2xl border border-black/10 bg-white shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
              <p className="text-sm font-black text-gray-900">Notificações</p>
              {notifs.length > 0 && (
                <Link href="/vendas/leads" onClick={() => setOpen(false)} className="text-[11px] font-black text-primary-container hover:opacity-80">
                  Ver todas
                </Link>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-black/5">
              {!loaded && (
                <div className="flex items-center justify-center py-8">
                  <span className="h-5 w-5 rounded-full border-2 border-primary-container/30 border-t-primary-container animate-spin" />
                </div>
              )}
              {loaded && notifs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Icon name="notifications_none" className="text-3xl text-gray-200 mb-2" />
                  <p className="text-sm font-bold text-gray-400">Nenhuma notificação</p>
                  <p className="text-xs text-gray-300 mt-0.5">Você está em dia!</p>
                </div>
              )}
              {notifs.map(n => (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition"
                >
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${n.type === "mensagem" ? "bg-red-100" : n.type === "lead_frio" ? "bg-yellow-100" : "bg-blue-100"}`}>
                    <Icon name={typeIcon[n.type]} className={`text-sm ${n.type === "mensagem" ? "text-red-500" : n.type === "lead_frio" ? "text-yellow-600" : "text-blue-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 leading-snug">{n.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{n.body}</p>
                  </div>
                  <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${typeDot[n.type]}`} />
                </Link>
              ))}
            </div>

            {/* Footer */}
            {notifs.length > 0 && (
              <div className="border-t border-black/5 px-4 py-3">
                <Link
                  href="/vendas/leads"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-primary-container py-2 text-sm font-black text-black hover:opacity-90 transition"
                >
                  <Icon name="forum" className="text-sm" /> Responder leads
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

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
