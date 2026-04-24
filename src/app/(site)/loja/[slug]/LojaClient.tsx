"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

interface Social { instagram: string | null; facebook: string | null; youtube: string | null; tiktok: string | null }

interface Store {
  id: string; name: string; tradeName: string | null; companyName: string | null;
  avatarUrl: string | null; storeDescription: string | null;
  city: string | null; state: string | null;
  phone: string | null; whatsapp: string | null; sharePhone: boolean;
  plan: string; createdAt: string; storeSlug: string;
  isVerified: boolean; planName: string | null; subPlan: string | null;
  social: Social | null;
  _count: { vehicles: number };
}

interface Vehicle {
  id: string; brand: string; model: string; version: string | null;
  yearFab: number; yearModel: number; km: number; price: number;
  city: string; state: string; condition: string;
  previousPrice: number | null; fipePrice: number | null;
  photos: { url: string }[];
}

const PLAN_BADGE: Record<string, { label: string; cls: string }> = {
  STARTER: { label: "Starter",  cls: "bg-zinc-700 text-zinc-300" },
  PRO:     { label: "Pro",      cls: "bg-yellow-500/20 text-yellow-400" },
  ELITE:   { label: "Elite 🔥", cls: "bg-orange-500/20 text-orange-400" },
};

const SOCIAL_ICONS: { key: keyof Social; icon: string; label: string }[] = [
  { key: "instagram", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z", label: "Instagram" },
  { key: "facebook",  icon: "M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.887v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z", label: "Facebook" },
  { key: "youtube",   icon: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z", label: "YouTube" },
  { key: "tiktok",    icon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z", label: "TikTok" },
];

export default function LojaClient({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [store, setStore] = useState<Store | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("createdAt_desc");

  useEffect(() => {
    fetch(`/api/loja/${slug}`).then(async r => {
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
      <h1 className="text-2xl font-black text-on-surface">Loja não encontrada</h1>
      <p className="text-on-surface-variant text-sm">Esta loja pode ter sido removida ou o link está incorreto.</p>
      <Link href="/busca" className="bg-primary-container text-on-primary-container font-black px-8 py-3 rounded-full text-sm uppercase tracking-widest">
        Ver veículos
      </Link>
    </div>
  );

  const displayName = store.tradeName || store.companyName || store.name;
  const memberSince = new Date(store.createdAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const badge = store.subPlan ? PLAN_BADGE[store.subPlan] : null;

  const filtered = vehicles
    .filter(v => !search || `${v.brand} ${v.model} ${v.version ?? ""}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "price_asc")  return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "km_asc")     return a.km - b.km;
      return 0;
    });

  const socialLinks = store.social
    ? SOCIAL_ICONS.filter(s => store.social![s.key])
    : [];

  return (
    <div className="min-h-screen bg-zinc-50">

      {/* ── VITRINE AUTOMÁTICA ─────────────────────────────────────────────── */}
      <div className="relative bg-zinc-900 overflow-hidden">
        {/* Fundo padrão desfocado estilo home */}
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDehxNs9I9ak52LfvX_Zc3BVGNcPeZ1FnK3XDjiLtGXZpa8_S7fs9ePvOMwHIMiWFG1MPgWz_J1MhDiXcMV3kWnIN33Y1Ax_jyj6riWUhcLHJFWN2upxKz16lyPpVDyryAsfcodfBkdqXYPgR-GSTeLhBIGITS1-SjCZKAyMu_7hWkDEJFVxesHEpPQXR7YwOEozTX6cZxyBvPl78nytBKtX_iQcHHyN5V6epMv-4viGLiRp8Bj5gkmWv064nm8rRhpNpvZNuqVXsI"
            alt=""
            className="w-full h-full object-cover opacity-20 blur-[2px] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/70 via-zinc-900/80 to-zinc-900" />
        </div>

        <div className="relative max-w-screen-xl mx-auto px-6 md:px-10 py-10 md:py-14">
          <div className="flex flex-col items-start gap-8 md:gap-12">

            {/* ── INFO DA LOJA ── */}
            <div className="w-full max-w-2xl flex flex-col justify-center">
              {/* Logo */}
              <div className="mb-5 flex items-center gap-4">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-white/10 bg-white/10 overflow-hidden flex items-center justify-center shadow-2xl flex-shrink-0">
                  {store.avatarUrl ? (
                    <img src={store.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl md:text-3xl font-black text-white">{displayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {store.isVerified && (
                      <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                        <Icon name="verified" className="text-xs" /> Verificada
                      </span>
                    )}
                    {badge && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide ${badge.cls}`}>
                        {badge.label}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">{displayName}</h1>
                </div>
              </div>

              {/* Cidade/UF */}
              {store.city && store.state && (
                <div className="flex items-center gap-1.5 text-zinc-400 text-sm mb-3">
                  <Icon name="location_on" className="text-base text-zinc-500" />
                  {store.city}, {store.state}
                </div>
              )}

              {/* Descrição / slogan */}
              {store.storeDescription && (
                <p className="text-zinc-300 text-sm leading-relaxed mb-5 max-w-md line-clamp-3">
                  {store.storeDescription}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-5 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-black text-white">{store._count.vehicles}</p>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Veículos</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-sm font-bold text-zinc-300">{memberSince}</p>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Na ShopMotor</p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                {store.whatsapp && (
                  <a href={`https://wa.me/55${store.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 text-white font-black px-5 py-2.5 rounded-full text-sm hover:bg-green-500 transition-colors">
                    <Icon name="chat" className="text-base" /> WhatsApp
                  </a>
                )}
                {store.phone && !store.whatsapp && (
                  <a href={`tel:${store.phone.replace(/\D/g, "")}`}
                    className="inline-flex items-center gap-2 bg-white/10 text-white font-bold px-5 py-2.5 rounded-full text-sm hover:bg-white/20 transition-colors">
                    <Icon name="call" className="text-base" /> {store.phone}
                  </a>
                )}
                {/* Redes sociais */}
                {socialLinks.map(s => store.social![s.key] && (
                  <a key={s.key} href={store.social![s.key]!} target="_blank" rel="noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    title={s.label}>
                    <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                      <path d={s.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── ESTOQUE ──────────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-10">

        {/* Filtros */}
        <div className="flex items-center gap-3 flex-wrap mb-6">
          <h2 className="text-xl font-black text-zinc-900 flex-1">
            Estoque <span className="text-zinc-400 font-normal text-base">({filtered.length})</span>
          </h2>
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-lg" />
            <input type="search" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar modelo..."
              className="bg-white border border-zinc-200 rounded-full pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 outline-none w-44" />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="bg-white border border-zinc-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-yellow-400">
            <option value="createdAt_desc">Mais recentes</option>
            <option value="price_asc">Menor preço</option>
            <option value="price_desc">Maior preço</option>
            <option value="km_asc">Menor km</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Icon name="search_off" className="text-5xl text-zinc-300 mb-3" />
            <p className="font-bold text-zinc-500">Nenhum veículo encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(v => <VehicleCard key={v.id} v={v} storeSlug={slug} showFinanciamento={store.subPlan === "ELITE"} />)}
          </div>
        )}

        {/* Avaliações — futuras */}
        <div className="mt-14 bg-white rounded-2xl border border-zinc-100 p-8 text-center">
          <Icon name="star_rate" className="text-3xl text-zinc-300 mb-3" />
          <p className="font-black text-zinc-500 text-sm">Avaliações em breve</p>
          <p className="text-xs text-zinc-400 mt-1">Os clientes poderão avaliar esta loja em uma próxima atualização.</p>
        </div>
      </div>

    </div>
  );
}

function VehicleCard({ v, storeSlug, showFinanciamento }: { v: Vehicle; storeSlug: string; showFinanciamento: boolean }) {
  const price = v.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
  const km    = v.km === 0 ? "0 km" : `${v.km.toLocaleString("pt-BR")} km`;
  const cover = v.photos[0]?.url ?? null;
  const financiamentoUrl = `/financiamento?loja=${storeSlug}&veiculo=${v.id}`;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col border border-zinc-100 hover:shadow-md hover:-translate-y-0.5 transition-all">
      <Link href={`/carro/${v.id}`} className="group">
        <div className="h-44 overflow-hidden relative bg-zinc-100">
          {cover ? (
            <img src={cover} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon name="directions_car" className="text-5xl text-zinc-300" />
            </div>
          )}
          {v.condition === "NEW" && (
            <div className="absolute top-3 left-3 bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded">0 km</div>
          )}
        </div>
        <div className="p-5 flex flex-col flex-1">
          <p className="text-xs font-black uppercase tracking-widest text-yellow-600 mb-0.5">{v.brand}</p>
          <h3 className="font-bold text-base text-zinc-900 leading-tight">{v.model}{v.version ? ` ${v.version}` : ""}</h3>
          <p className="text-xs text-zinc-500 mt-1 mb-3">{v.yearFab}/{v.yearModel} · {km}</p>
          <p className="text-xl font-black text-zinc-900 mt-auto">{price}</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {v.previousPrice && v.previousPrice > v.price && (
              <span className="text-[10px] font-black text-green-700 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Icon name="trending_down" className="text-xs" />Baixou
              </span>
            )}
            {v.fipePrice && v.fipePrice > 0 && v.price < v.fipePrice && (
              <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Icon name="verified" className="text-xs" />Abaixo da FIPE
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Bloco de financiamento — apenas lojas Elite */}
      {showFinanciamento && (
        <div className="mx-4 mb-4 bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="account_balance" className="text-yellow-400 text-base" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[11px] font-black leading-tight">Financie este veículo</p>
            <p className="text-zinc-400 text-[10px]">Simule em segundos · sem consulta ao SPC</p>
          </div>
          <Link href={financiamentoUrl}
            className="bg-yellow-500 text-black text-[10px] font-black px-3 py-1.5 rounded-lg whitespace-nowrap hover:bg-yellow-400 transition-colors flex-shrink-0">
            SIMULAR
          </Link>
        </div>
      )}
    </div>
  );
}
