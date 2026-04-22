"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  version: string | null;
  yearFab: number;
  yearModel: number;
  km: number;
  price: number;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "SOLD" | "EXPIRED";
  boostLevel: "NONE" | "DESTAQUE" | "ELITE";
  expiresAt: string | null;
  views: number;
  city: string;
  state: string;
  photos: { url: string }[];
}

const STATUS_LABEL: Record<Vehicle["status"], string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Ativo",
  PAUSED: "Pausado",
  SOLD: "Vendido",
  EXPIRED: "Expirado",
};

const STATUS_COLOR: Record<Vehicle["status"], string> = {
  DRAFT:   "bg-surface-container text-on-surface-variant",
  ACTIVE:  "bg-green-100 text-green-700",
  PAUSED:  "bg-yellow-100 text-yellow-700",
  SOLD:    "bg-blue-100 text-blue-700",
  EXPIRED: "bg-error/10 text-error",
};

export default function MeusAnunciosPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/vehicles/mine");
    if (res.ok) {
      const data = await res.json();
      setVehicles(data.vehicles);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleStatus(id: string, current: Vehicle["status"]) {
    const newStatus = current === "ACTIVE" ? "PAUSED" : "ACTIVE";
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) setVehicles(prev => prev.map(v => v.id === id ? { ...v, status: current } : v));
    } catch {
      setVehicles(prev => prev.map(v => v.id === id ? { ...v, status: current } : v));
    }
  }

  async function markAsSold(id: string) {
    if (!confirm("Confirmar que este veículo foi vendido?")) return;
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, status: "SOLD" } : v));
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SOLD" }),
      });
      if (!res.ok) load();
    } catch { load(); }
  }

  async function renewVehicle(id: string) {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, status: "ACTIVE" } : v));
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACTIVE" }),
      });
      if (!res.ok) load();
      else load();
    } catch { load(); }
  }

  async function deleteVehicle(id: string) {
    if (!confirm("Tem certeza que deseja excluir este anúncio?")) return;
    setDeletingId(id);
    await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
    setVehicles(prev => prev.filter(v => v.id !== id));
    setDeletingId(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-on-surface uppercase">Meus Anúncios</h1>
          <p className="text-on-surface-variant text-sm mt-1">{vehicles.length} anúncio{vehicles.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/perfil/cadastrar"
          className="flex items-center gap-2 bg-primary-container text-on-primary-container font-black px-6 py-2.5 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all active:scale-95"
        >
          <Icon name="add" />
          Novo anúncio
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Icon name="directions_car" className="text-6xl text-outline mb-4" />
          <h3 className="font-bold text-lg text-on-surface mb-2">Nenhum anúncio ainda</h3>
          <p className="text-on-surface-variant text-sm mb-6">Cadastre seu primeiro veículo e comece a vender.</p>
          <Link href="/perfil/cadastrar" className="bg-primary-container text-on-primary-container font-black px-8 py-3 rounded-full text-sm uppercase tracking-widest">
            Cadastrar veículo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {vehicles.map(v => {
            const price = v.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
            const km = v.km === 0 ? "0 km" : `${v.km.toLocaleString("pt-BR")} km`;
            const coverUrl = v.photos[0]?.url ?? null;

            return (
              <div key={v.id} className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row">
                {/* Thumbnail */}
                <div className="sm:w-48 h-40 sm:h-auto flex-shrink-0 bg-surface-container relative">
                  {coverUrl ? (
                    <img src={coverUrl} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="directions_car" className="text-5xl text-outline" />
                    </div>
                  )}
                  <span className={`absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded uppercase ${STATUS_COLOR[v.status]}`}>
                    {STATUS_LABEL[v.status]}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 p-5 flex flex-col justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-primary mb-0.5">{v.brand}</p>
                    <h3 className="font-bold text-base text-on-surface leading-tight">
                      {v.model}{v.version ? ` ${v.version}` : ""}
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {v.yearFab}/{v.yearModel} • {km} • {v.city}, {v.state}
                    </p>
                    {v.expiresAt && v.status === "ACTIVE" && (() => {
                      const days = Math.ceil((new Date(v.expiresAt).getTime() - Date.now()) / 86400000);
                      return days <= 7 ? (
                        <p className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded mt-1 inline-flex items-center gap-1">
                          <Icon name="schedule" className="text-xs" />
                          Expira em {days} dia{days !== 1 ? "s" : ""}
                        </p>
                      ) : (
                        <p className="text-[10px] text-on-surface-variant mt-1 inline-flex items-center gap-1">
                          <Icon name="schedule" className="text-xs" />
                          Expira em {days} dias
                        </p>
                      );
                    })()}
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-xl font-black text-on-surface">{price}</p>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <Icon name="visibility" className="text-sm" />
                        {v.views} visualizações
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Impulsionar */}
                      {(v.status === "ACTIVE" || v.status === "PAUSED") && (
                        <Link
                          href={`/perfil/impulsionar/${v.id}`}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all hover:-translate-y-0.5 ${v.boostLevel !== "NONE" ? "bg-primary-container text-on-primary-container" : "border border-primary-container text-primary hover:bg-primary-container hover:text-on-primary-container"}`}
                          aria-label="Impulsionar anúncio"
                        >
                          <Icon name="rocket_launch" className="text-sm" />
                          {v.boostLevel !== "NONE" ? v.boostLevel : "Impulsionar"}
                        </Link>
                      )}

                      {/* Ver */}
                      <Link
                        href={`/carro/${v.id}`}
                        className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
                        aria-label="Ver anúncio"
                      >
                        <Icon name="open_in_new" className="text-lg" />
                      </Link>

                      {/* Editar */}
                      <Link
                        href={`/perfil/editar/${v.id}`}
                        className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
                        aria-label="Editar anúncio"
                      >
                        <Icon name="edit" className="text-lg" />
                      </Link>

                      {/* Publicar rascunho */}
                      {v.status === "DRAFT" && (
                        <button
                          onClick={() => toggleStatus(v.id, v.status)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container text-on-primary-container text-xs font-black uppercase tracking-widest hover:-translate-y-0.5 transition-all"
                        >
                          <Icon name="publish" className="text-sm" />
                          Publicar
                        </button>
                      )}

                      {/* Renovar anúncio expirado */}
                      {v.status === "EXPIRED" && (
                        <button
                          onClick={() => renewVehicle(v.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container text-on-primary-container text-xs font-black uppercase tracking-widest hover:-translate-y-0.5 transition-all"
                        >
                          <Icon name="refresh" className="text-sm" />
                          Renovar
                        </button>
                      )}

                      {/* Marcar como Vendido */}
                      {(v.status === "ACTIVE" || v.status === "PAUSED") && (
                        <button
                          onClick={() => markAsSold(v.id)}
                          className="p-2 rounded-full hover:bg-blue-50 text-on-surface-variant hover:text-blue-600 transition-colors"
                          aria-label="Marcar como vendido"
                          title="Marcar como vendido"
                        >
                          <Icon name="handshake" className="text-lg" />
                        </button>
                      )}

                      {/* Pausar/Ativar */}
                      {(v.status === "ACTIVE" || v.status === "PAUSED") && (
                        <button
                          onClick={() => toggleStatus(v.id, v.status)}
                          className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
                          aria-label={v.status === "ACTIVE" ? "Pausar anúncio" : "Ativar anúncio"}
                        >
                          <Icon name={v.status === "ACTIVE" ? "pause" : "play_arrow"} className="text-lg" />
                        </button>
                      )}

                      {/* Excluir */}
                      <button
                        onClick={() => deleteVehicle(v.id)}
                        disabled={deletingId === v.id}
                        className="p-2 rounded-full hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors disabled:opacity-40"
                        aria-label="Excluir anúncio"
                      >
                        {deletingId === v.id
                          ? <span className="w-4 h-4 border-2 border-error/30 border-t-error rounded-full animate-spin block" />
                          : <Icon name="delete" className="text-lg" />
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
