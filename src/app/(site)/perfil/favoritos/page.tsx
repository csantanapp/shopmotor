"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/context/AuthContext";

interface Vehicle {
  id: string; brand: string; model: string; version: string | null;
  yearFab: number; yearModel: number; km: number; price: number;
  city: string; state: string; status: string;
  photos: { url: string }[];
}

interface Favorite { id: string; vehicle: Vehicle; }

export default function FavoritosPage() {
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    fetch("/api/favorites/mine")
      .then(r => r.json())
      .then(d => setFavorites(d.favorites ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  async function removeFav(vehicleId: string) {
    await fetch(`/api/favorites?vehicleId=${vehicleId}`, { method: "DELETE" });
    setFavorites(prev => prev.filter(f => f.vehicle.id !== vehicleId));
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="w-8 h-8 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-on-surface uppercase">Favoritos</h1>
        <p className="text-on-surface-variant text-sm mt-1">{favorites.length} veículo{favorites.length !== 1 ? "s" : ""} salvo{favorites.length !== 1 ? "s" : ""}</p>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Icon name="favorite_border" className="text-6xl text-outline mb-4" />
          <h3 className="font-bold text-lg text-on-surface mb-2">Nenhum favorito ainda</h3>
          <p className="text-on-surface-variant text-sm mb-6">Salve veículos que chamaram sua atenção.</p>
          <Link href="/busca" className="bg-primary-container text-on-primary-container font-black px-8 py-3 rounded-full text-sm uppercase tracking-widest">
            Buscar veículos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {favorites.map(({ vehicle: v }) => {
            const price = v.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
            const km = v.km === 0 ? "0 km" : `${v.km.toLocaleString("pt-BR")} km`;
            const coverUrl = v.photos[0]?.url ?? null;
            return (
              <div key={v.id} className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm flex flex-col group">
                <div className="h-44 overflow-hidden relative bg-surface-container">
                  {coverUrl ? (
                    <img src={coverUrl} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="directions_car" className="text-5xl text-outline" />
                    </div>
                  )}
                  <button
                    onClick={() => removeFav(v.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-error/80 rounded-full flex items-center justify-center transition-colors"
                    aria-label="Remover dos favoritos"
                  >
                    <Icon name="favorite" fill className="text-sm text-red-400" />
                  </button>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-primary mb-0.5">{v.brand}</p>
                    <h3 className="font-bold text-base leading-tight text-on-surface mb-1 truncate">
                      {v.model}{v.version ? ` ${v.version}` : ""}
                    </h3>
                    <p className="text-xs text-on-surface-variant">{v.yearFab}/{v.yearModel} · {km}</p>
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p className="text-lg font-black text-on-surface">{price}</p>
                      <div className="flex items-center gap-1 text-[10px] text-on-surface-variant mt-1">
                        <Icon name="location_on" className="text-sm" />{v.city}, {v.state}
                      </div>
                    </div>
                    <Link
                      href={`/carro/${v.id}`}
                      className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                    >
                      Ver anúncio <Icon name="arrow_forward" className="text-sm" />
                    </Link>
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
