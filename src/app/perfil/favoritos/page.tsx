"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

interface FavoriteVehicle {
  id: string;
  vehicleId: string;
  vehicle: {
    id: string;
    brand: string;
    model: string;
    version: string | null;
    yearFab: number;
    yearModel: number;
    km: number;
    price: number;
    city: string;
    state: string;
    photos: { url: string }[];
  };
}

export default function FavoritosPage() {
  const [favorites, setFavorites] = useState<FavoriteVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/favorites");
    if (res.ok) {
      const data = await res.json();
      setFavorites(data.favorites);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function removeFavorite(vehicleId: string) {
    setFavorites(prev => prev.filter(f => f.vehicleId !== vehicleId));
    await fetch(`/api/favorites?vehicleId=${vehicleId}`, { method: "DELETE" });
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
          <h1 className="text-3xl font-black tracking-tighter text-on-surface uppercase">Favoritos</h1>
          <p className="text-on-surface-variant text-sm mt-1">{favorites.length} veículo{favorites.length !== 1 ? "s" : ""} salvo{favorites.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/busca" className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
          <Icon name="search" className="text-lg" />
          Buscar mais veículos
        </Link>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Icon name="favorite_border" className="text-6xl text-outline mb-4" />
          <h3 className="font-bold text-lg text-on-surface mb-2">Nenhum favorito ainda</h3>
          <p className="text-on-surface-variant text-sm mb-6">Salve veículos enquanto navega para encontrá-los aqui.</p>
          <Link href="/busca" className="bg-primary-container text-on-primary-container font-black px-8 py-3 rounded-full text-sm uppercase tracking-widest">
            Explorar veículos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(({ vehicleId, vehicle: v }) => {
            const price = v.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
            const km = v.km === 0 ? "0 km" : `${v.km.toLocaleString("pt-BR")} km`;
            const coverUrl = v.photos[0]?.url ?? null;

            return (
              <div key={vehicleId} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm group relative">
                {/* Remove */}
                <button
                  onClick={() => removeFavorite(vehicleId)}
                  aria-label="Remover dos favoritos"
                  className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-error transition-colors"
                >
                  <Icon name="favorite" fill className="text-sm text-red-400" />
                </button>

                <Link href={`/carro/${v.id}`}>
                  <div className="h-44 overflow-hidden relative bg-surface-container">
                    {coverUrl ? (
                      <img src={coverUrl} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="directions_car" className="text-5xl text-outline" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">{v.brand}</p>
                    <h3 className="font-bold text-base leading-tight text-on-surface mb-1">{v.model}{v.version ? ` ${v.version}` : ""}</h3>
                    <p className="text-xs text-on-surface-variant mb-3">{v.yearFab}/{v.yearModel} • {km}</p>
                    <p className="text-xl font-black text-on-surface">{price}</p>
                    <div className="flex items-center gap-1 text-[10px] text-on-surface-variant mt-2">
                      <Icon name="location_on" className="text-sm" />
                      {v.city}, {v.state}
                    </div>
                  </div>
                </Link>

                <div className="px-5 pb-5">
                  <Link href={`/carro/${v.id}`} className="w-full block text-center bg-surface-container hover:bg-primary-container hover:text-on-primary-container text-on-surface font-bold py-2.5 rounded-full text-sm transition-colors">
                    Ver anúncio
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
