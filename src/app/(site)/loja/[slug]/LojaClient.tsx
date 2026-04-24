"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

interface Store {
  id: string; name: string; tradeName: string | null; companyName: string | null;
  avatarUrl: string | null; storeBannerUrl: string | null; storeDescription: string | null;
  city: string | null; state: string | null; phone: string | null; sharePhone: boolean;
  plan: string; createdAt: string; storeSlug: string;
  _count: { vehicles: number };
}

interface Vehicle {
  id: string; brand: string; model: string; version: string | null;
  yearFab: number; yearModel: number; km: number; price: number;
  city: string; state: string; condition: string;
  previousPrice: number | null; fipePrice: number | null;
  photos: { url: string }[];
}

export default function LojaClient({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [store, setStore] = useState<Store | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("createdAt_desc");

  useEffect(() => {
    fetch(`/api/loja/${slug}`)
      .then(async r => {
        if (!r.ok) { setNotFound(true); setLoading(false); return; }
        const d = await r.json();
        setStore(d.store);
        setVehicles(d.vehicles);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <span className="w-10 h-10 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
    </div>
  );

  if (notFound || !store) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 gap-4">
      <Icon name="store_off" className="text-6xl text-outline" />
      <h1 className="text-2xl font-black text-on-surface">Loja nao encontrada</h1>
      <p className="text-on-surface-variant text-sm">Esta loja pode ter sido removida ou o link esta incorreto.</p>
      <Link href="/busca" className="bg-primary-container text-on-primary-container font-black px-8 py-3 rounded-full text-sm uppercase tracking-widest">
        Ver veiculos
      </Link>
    </div>
  );

  const displayName = store.tradeName || store.companyName || store.name;
  const memberSince = new Date(store.createdAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const filtered = vehicles
    .filter(v => !search || `${v.brand} ${v.model} ${v.version ?? ""}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "price_asc")  return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "km_asc")     return a.km - b.km;
      return 0;
    });

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-6 pb-12">

      {/* Banner */}
      <div className="relative h-52 md:h-72 bg-surface-container rounded-b-3xl overflow-hidden -mx-4 md:-mx-6 mb-0">
        {store.storeBannerUrl ? (
          <img src={store.storeBannerUrl} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-inverse-surface to-neutral-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Header da loja */}
      <div className="relative px-0 md:px-4 -mt-16 mb-8">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="w-24 h-24 rounded-2xl border-4 border-surface bg-surface-container overflow-hidden flex items-center justify-center shadow-xl flex-shrink-0">
            {store.avatarUrl ? (
              <img src={store.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-black text-on-surface-variant">{displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 pb-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-black text-on-surface tracking-tight">{displayName}</h1>
              {store.plan === "PREMIUM" && (
                <span className="flex items-center gap-1 bg-primary-container text-on-primary-container text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  <Icon name="verified" className="text-xs" />Premium
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-on-surface-variant">
              {store.city && store.state && (
                <span className="flex items-center gap-1">
                  <Icon name="location_on" className="text-sm" />{store.city}, {store.state}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Icon name="calendar_today" className="text-sm" />Na ShopMotor desde {memberSince}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="directions_car" className="text-sm" />{store._count.vehicles} veiculos
              </span>
            </div>
          </div>
          {store.sharePhone && store.phone && (
            <a
              href={`https://wa.me/55${store.phone.replace(/\D/g, "")}`}
              target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-green-500 text-white font-black px-6 py-3 rounded-full text-sm hover:-translate-y-0.5 transition-all flex-shrink-0"
            >
              <Icon name="chat" className="text-base" />WhatsApp
            </a>
          )}
        </div>

        {store.storeDescription && (
          <p className="mt-4 text-sm text-on-surface-variant leading-relaxed max-w-2xl bg-surface-container-lowest rounded-2xl p-4 shadow-sm">
            {store.storeDescription}
          </p>
        )}
      </div>

      {/* Veiculos */}
      <div className="space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl font-black text-on-surface flex-1">
            Estoque ({filtered.length})
          </h2>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg" />
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar na loja..."
                className="bg-surface-container-low border-0 rounded-full pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-container outline-none w-48"
              />
            </div>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="bg-surface-container-low border-0 rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-container outline-none"
            >
              <option value="createdAt_desc">Mais recentes</option>
              <option value="price_asc">Menor preco</option>
              <option value="price_desc">Maior preco</option>
              <option value="km_asc">Menor km</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Icon name="search_off" className="text-5xl text-outline mx-auto" />
            <p className="font-bold text-on-surface-variant">Nenhum veiculo encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(v => (
              <VehicleCard key={v.id} v={v} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

function VehicleCard({ v }: { v: Vehicle }) {
  const price = v.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
  const km    = v.km === 0 ? "0 km" : `${v.km.toLocaleString("pt-BR")} km`;
  const cover = v.photos[0]?.url ?? null;

  return (
    <Link href={`/carro/${v.id}`} className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm group flex flex-col hover:shadow-md transition-shadow">
      <div className="h-44 overflow-hidden relative bg-surface-container">
        {cover ? (
          <img src={cover} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="directions_car" className="text-5xl text-outline" />
          </div>
        )}
        {v.condition === "NEW" && (
          <div className="absolute top-3 left-3 bg-primary-container text-on-primary-container text-[10px] font-black px-2 py-1 rounded">0 km</div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs font-black uppercase tracking-widest text-primary mb-0.5">{v.brand}</p>
        <h3 className="font-bold text-base text-on-surface leading-tight">{v.model}{v.version ? ` ${v.version}` : ""}</h3>
        <p className="text-xs text-on-surface-variant mt-1 mb-3">{v.yearFab}/{v.yearModel} · {km}</p>
        <p className="text-xl font-black text-on-surface mt-auto">{price}</p>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {v.previousPrice && v.previousPrice > v.price && (
            <span className="flex items-center gap-1 text-[10px] font-black text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
              <Icon name="trending_down" className="text-xs" />Baixou o preco
            </span>
          )}
          {v.fipePrice && v.fipePrice > 0 && v.price < v.fipePrice && (
            <span className="flex items-center gap-1 text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              <Icon name="verified" className="text-xs" />Abaixo da FIPE
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
