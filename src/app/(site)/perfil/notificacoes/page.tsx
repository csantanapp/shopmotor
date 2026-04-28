"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

const TYPE_ICON: Record<string, string> = {
  vehicle_expired:    "timer_off",
  vehicle_warning:    "schedule",
  slot_available:     "check_circle",
  renewal_confirmed:  "refresh",
  boost_activated:    "rocket_launch",
  cycle_exhausted:    "block",
};

const TYPE_COLOR: Record<string, string> = {
  vehicle_expired:    "text-orange-500",
  vehicle_warning:    "text-yellow-500",
  slot_available:     "text-green-500",
  renewal_confirmed:  "text-primary",
  boost_activated:    "text-primary",
  cycle_exhausted:    "text-error",
};

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  actionUrl: string | null;
  readAt: string | null;
  createdAt: string;
};

export default function NotificacoesPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/notifications");
    if (res.ok) {
      const data = await res.json();
      setItems(data.notifications);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    // Marca todas como lidas ao abrir a página
    fetch("/api/notifications", { method: "PATCH" });
  }, [load]);

  const unread = items.filter(n => !n.readAt).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-on-surface uppercase">Notificações</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            {unread > 0 ? `${unread} não lida${unread > 1 ? "s" : ""}` : "Todas lidas"}
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <span className="w-8 h-8 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="bg-surface-container-lowest rounded-2xl p-16 text-center shadow-sm">
          <Icon name="notifications_none" className="text-5xl text-outline mb-3" />
          <p className="font-bold text-on-surface">Nenhuma notificação</p>
          <p className="text-sm text-on-surface-variant mt-1">Você será notificado sobre seus anúncios aqui.</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
          {items.map((n, i) => (
            <div
              key={n.id}
              className={`flex items-start gap-4 px-6 py-4 border-b border-neutral-100 last:border-0 ${!n.readAt ? "bg-primary-container/5" : ""}`}
            >
              <div className={`w-9 h-9 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon name={TYPE_ICON[n.type] ?? "notifications"} className={`text-lg ${TYPE_COLOR[n.type] ?? "text-on-surface-variant"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold text-on-surface ${!n.readAt ? "text-on-surface" : "text-on-surface-variant"}`}>
                  {n.title}
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{n.body}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-outline">
                    {new Date(n.createdAt).toLocaleDateString("pt-BR")} às {new Date(n.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {n.actionUrl && (
                    <Link href={n.actionUrl} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                      Ver →
                    </Link>
                  )}
                </div>
              </div>
              {!n.readAt && (
                <div className="w-2 h-2 rounded-full bg-primary-container flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
