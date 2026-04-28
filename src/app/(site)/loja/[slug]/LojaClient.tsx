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
  fuel: string; transmission: string; color: string;
  armored: boolean; auction: boolean; vehicleType: string;
  previousPrice: number | null; fipePrice: number | null;
  boostLevel: string;
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

const brandOptions = [
  "Todas","Aston Martin","Audi","Bentley","BMW","BYD","Cadillac","Caoa Changan","Caoa Chery",
  "Chevrolet","Chrysler","Citroën","Denza","Dodge","Effa","Ferrari","Fiat","Ford","Foton",
  "GAC","Geely","GMC","GWM","Honda","Hyundai","Iveco","JAC","Jaecoo","Jaguar","Jeep","Jetour",
  "Kia","Lamborghini","Land Rover","Leapmotor","Lexus","McLaren","Mercedes-Benz","MG","Mini",
  "Mitsubishi","Nissan","Omoda","Peugeot","Porsche","RAM","Renault","Riddara","Rolls-Royce",
  "Shineray","Tesla","Toyota","Volkswagen","Volvo","Zeekr","Outros",
];
const fuelOptions         = ["Todos","Flex","Gasolina","Diesel","Elétrico","Híbrido","GNV"];
const bodyOptions         = ["Todos","Hatch","Sedã","SUV","Picape","Minivan","Esportivo","Conversível"];
const motoTypeOptions     = ["Todos","Street","Naked","Esportiva","Trail/Adventure","Custom/Cruiser","Scooter","Enduro/Motocross","Touring"];
const transmissionOptions = ["Todos","Automático","Manual","CVT","Automatizado"];
const colorOptions        = ["Todas","Branco","Preto","Prata","Cinza","Vermelho","Azul","Verde","Amarelo","Laranja","Marrom","Bege","Dourado","Outro"];

const CURRENT_YEAR = new Date().getFullYear();
const selectCls = "w-full bg-surface-container-low border-0 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary-container outline-none";
const inputCls  = "w-full bg-surface-container-low border-0 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary-container outline-none placeholder:text-outline";

export default function LojaClient({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [store, setStore]     = useState<Store | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [search, setSearch]                   = useState("");
  const [brand, setBrand]                     = useState("Todas");
  const [fuel, setFuel]                       = useState("Todos");
  const [body, setBody]                       = useState("Todos");
  const [transmission, setTransmission]       = useState("Todos");
  const [color, setColor]                     = useState("Todas");
  const [condition, setCondition]             = useState("Todos");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("Todos");
  const [motoType, setMotoType]               = useState("Todos");
  const [priceMin, setPriceMin]               = useState("");
  const [priceMax, setPriceMax]               = useState("");
  const [kmMin, setKmMin]                     = useState("");
  const [kmMax, setKmMax]                     = useState("");
  const [yearMin, setYearMin]                 = useState("");
  const [yearMax, setYearMax]                 = useState("");
  const [armored, setArmored]                 = useState(false);
  const [auction, setAuction]                 = useState(false);
  const [sort, setSort]                       = useState("createdAt_desc");
  const [filtersOpen, setFiltersOpen]         = useState(false);

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
      <Link href="/busca" className="bg-primary-container text-on-primary-container font-black px-8 py-3 rounded-full text-sm uppercase tracking-widest">Ver veículos</Link>
    </div>
  );

  const displayName = store.tradeName || store.companyName || store.name;
  const memberSince = new Date(store.createdAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const badge = store.subPlan ? PLAN_BADGE[store.subPlan] : null;
  const socialLinks = store.social ? SOCIAL_ICONS.filter(s => store.social![s.key]) : [];

  const resetFilters = () => {
    setBrand("Todas"); setFuel("Todos"); setBody("Todos"); setTransmission("Todos");
    setColor("Todas"); setCondition("Todos"); setVehicleTypeFilter("Todos"); setMotoType("Todos");
    setPriceMin(""); setPriceMax(""); setKmMin(""); setKmMax(""); setYearMin(""); setYearMax("");
    setArmored(false); setAuction(false); setSearch("");
  };

  const activeFiltersCount = [
    brand !== "Todas", fuel !== "Todos", body !== "Todos", transmission !== "Todos",
    color !== "Todas", condition !== "Todos", vehicleTypeFilter !== "Todos", motoType !== "Todos",
    !!priceMin, !!priceMax, !!kmMin, !!kmMax, !!yearMin, !!yearMax, armored, auction,
  ].filter(Boolean).length;

  const filtered = vehicles.filter(v => {
    if (search && !`${v.brand} ${v.model} ${v.version ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (brand !== "Todas" && v.brand !== brand) return false;
    if (fuel !== "Todos" && v.fuel !== fuel) return false;
    if (transmission !== "Todos" && v.transmission !== transmission) return false;
    if (color !== "Todas" && v.color !== color) return false;
    if (condition === "Novo"  && v.condition !== "NEW")  return false;
    if (condition === "Usado" && v.condition !== "USED") return false;
    if (vehicleTypeFilter === "CAR"  && v.vehicleType !== "CAR")  return false;
    if (vehicleTypeFilter === "MOTO" && v.vehicleType !== "MOTO") return false;
    if (priceMin && v.price < Number(priceMin.replace(/\D/g, ""))) return false;
    if (priceMax && v.price > Number(priceMax.replace(/\D/g, ""))) return false;
    if (kmMin && v.km < Number(kmMin.replace(/\D/g, ""))) return false;
    if (kmMax && v.km > Number(kmMax.replace(/\D/g, ""))) return false;
    if (yearMin && v.yearModel < Number(yearMin)) return false;
    if (yearMax && v.yearModel > Number(yearMax)) return false;
    if (armored && !v.armored) return false;
    if (auction && !v.auction) return false;
    return true;
  }).sort((a, b) => {
    if (sort === "price_asc")  return a.price - b.price;
    if (sort === "price_desc") return b.price - a.price;
    if (sort === "km_asc")     return a.km - b.km;
    return 0;
  });

  const FilterPanel = () => (
    <div className="space-y-5">
      <div className="relative">
        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Marca, modelo..."
          className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border-0 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-primary-container outline-none" />
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-sm uppercase tracking-wider text-on-surface">Filtros</h3>
          {activeFiltersCount > 0 && (
            <button onClick={resetFilters} className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
              <Icon name="close" className="text-sm" />Limpar ({activeFiltersCount})
            </button>
          )}
        </div>

        <FilterSection label="Tipo de veículo">
          <div className="flex gap-2">
            {[{ value: "CAR", label: "Carros", icon: "directions_car" }, { value: "MOTO", label: "Motos", icon: "two_wheeler" }].map(opt => (
              <button key={opt.value}
                onClick={() => setVehicleTypeFilter(v => v === opt.value ? "Todos" : opt.value)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${vehicleTypeFilter === opt.value ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant hover:bg-surface-container"}`}>
                <Icon name={opt.icon} className="text-base" />{opt.label}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection label="Condição">
          <div className="flex gap-2">
            {["Todos","Novo","Usado"].map(c => (
              <ChipBtn key={c} label={c} active={condition === c} onClick={() => setCondition(c)} />
            ))}
          </div>
        </FilterSection>

        <FilterSection label="Marca">
          <select value={brand} onChange={e => setBrand(e.target.value)} className={selectCls}>
            {brandOptions.map(b => <option key={b}>{b}</option>)}
          </select>
        </FilterSection>

        <FilterSection label="Ano (modelo)">
          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={yearMin} onChange={e => setYearMin(e.target.value)} placeholder="De" min={1960} max={CURRENT_YEAR + 1} className={inputCls} />
            <input type="number" value={yearMax} onChange={e => setYearMax(e.target.value)} placeholder="Até" min={1960} max={CURRENT_YEAR + 1} className={inputCls} />
          </div>
        </FilterSection>

        <FilterSection label="Preço (R$)">
          <div className="grid grid-cols-2 gap-2">
            <input value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder="Mínimo" className={inputCls} />
            <input value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder="Máximo" className={inputCls} />
          </div>
        </FilterSection>

        <FilterSection label="Quilometragem">
          <div className="grid grid-cols-2 gap-2">
            <input value={kmMin} onChange={e => setKmMin(e.target.value)} placeholder="KM mín." className={inputCls} />
            <input value={kmMax} onChange={e => setKmMax(e.target.value)} placeholder="KM máx." className={inputCls} />
          </div>
        </FilterSection>

        {vehicleTypeFilter !== "MOTO" && (
          <FilterSection label="Carroceria">
            <div className="flex flex-wrap gap-1.5">
              {bodyOptions.map(b => <ChipBtn key={b} label={b} active={body === b} onClick={() => setBody(b)} />)}
            </div>
          </FilterSection>
        )}

        {vehicleTypeFilter === "MOTO" && (
          <FilterSection label="Tipo de moto">
            <div className="flex flex-wrap gap-1.5">
              {motoTypeOptions.map(t => <ChipBtn key={t} label={t} active={motoType === t} onClick={() => setMotoType(t)} />)}
            </div>
          </FilterSection>
        )}

        <FilterSection label="Combustível">
          <div className="flex flex-wrap gap-1.5">
            {fuelOptions.map(f => <ChipBtn key={f} label={f} active={fuel === f} onClick={() => setFuel(f)} />)}
          </div>
        </FilterSection>

        <FilterSection label="Câmbio">
          <div className="flex flex-wrap gap-1.5">
            {transmissionOptions.map(t => <ChipBtn key={t} label={t} active={transmission === t} onClick={() => setTransmission(t)} />)}
          </div>
        </FilterSection>

        <FilterSection label="Cor">
          <select value={color} onChange={e => setColor(e.target.value)} className={selectCls}>
            {colorOptions.map(c => <option key={c}>{c}</option>)}
          </select>
        </FilterSection>

        <FilterSection label="Outras opções">
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={armored} onChange={e => setArmored(e.target.checked)} className="w-4 h-4 accent-yellow-500 rounded" />
              <span className="text-sm font-semibold text-on-surface">Blindado</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={auction} onChange={e => setAuction(e.target.checked)} className="w-4 h-4 accent-yellow-500 rounded" />
              <span className="text-sm font-semibold text-on-surface">Leilão</span>
            </label>
          </div>
        </FilterSection>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">

      {/* ── BANNER ── */}
      <div className="relative bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDehxNs9I9ak52LfvX_Zc3BVGNcPeZ1FnK3XDjiLtGXZpa8_S7fs9ePvOMwHIMiWFG1MPgWz_J1MhDiXcMV3kWnIN33Y1Ax_jyj6riWUhcLHJFWN2upxKz16lyPpVDyryAsfcodfBkdqXYPgR-GSTeLhBIGITS1-SjCZKAyMu_7hWkDEJFVxesHEpPQXR7YwOEozTX6cZxyBvPl78nytBKtX_iQcHHyN5V6epMv-4viGLiRp8Bj5gkmWv064nm8rRhpNpvZNuqVXsI"
            alt="" className="w-full h-full object-cover opacity-20 blur-[2px] scale-105" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/60 via-zinc-900/75 to-zinc-900" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-14">
          <div className="flex flex-col md:flex-row md:items-center gap-8">

            {/* ESQUERDA */}
            <div className="flex items-center gap-5 flex-1">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 border-white/10 bg-white/10 overflow-hidden flex items-center justify-center shadow-2xl flex-shrink-0">
                {store.avatarUrl
                  ? <img src={store.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  : <span className="text-3xl font-black text-white">{displayName.charAt(0).toUpperCase()}</span>}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  {store.isVerified && (
                    <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                      <Icon name="verified" className="text-xs" /> Verificada
                    </span>
                  )}
                  {badge && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide ${badge.cls}`}>{badge.label}</span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">{displayName}</h1>
                {store.city && store.state && (
                  <div className="flex items-center gap-1 text-zinc-400 text-sm mt-1.5">
                    <Icon name="location_on" className="text-sm text-zinc-500" />{store.city}, {store.state}
                  </div>
                )}
                {store.storeDescription && (
                  <p className="text-zinc-400 text-sm mt-2 line-clamp-2 max-w-xs">{store.storeDescription}</p>
                )}
              </div>
            </div>

            {/* DIREITA */}
            <div className="flex flex-col items-start md:items-end gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-3xl font-black text-white">{store._count.vehicles}</p>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Veículos</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-sm font-bold text-zinc-300">{memberSince}</p>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Na ShopMotor</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {/* WhatsApp só para planos pagos (Starter, Pro, Elite) */}
                {store.whatsapp && store.subPlan && (
                  <a href={`https://wa.me/55${store.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Olá! Vim pelo site Shopmotor e gostaria de informações sobre a loja e os carros.")}`}
                    target="_blank" rel="noreferrer"
                    onClick={() => fetch(`/api/loja/${slug}/wa-click`, { method: "POST", headers: { "x-session-id": sessionStorage.getItem("sm_sid") ?? "" } }).catch(() => null)}
                    className="inline-flex items-center gap-2 bg-green-600 text-white font-black px-6 py-3 rounded-full text-sm hover:bg-green-500 transition-colors shadow-lg">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    WhatsApp
                  </a>
                )}
                {store.phone && !store.whatsapp && (
                  <a href={`tel:${store.phone.replace(/\D/g, "")}`}
                    className="inline-flex items-center gap-2 bg-white/10 text-white font-bold px-5 py-3 rounded-full text-sm hover:bg-white/20 transition-colors">
                    <Icon name="call" className="text-base" /> {store.phone}
                  </a>
                )}
              </div>
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-2">
                  {socialLinks.map(s => store.social![s.key] && (
                    <a key={s.key} href={store.social![s.key]!} target="_blank" rel="noreferrer"
                      className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors" title={s.label}>
                      <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24"><path d={s.icon} /></svg>
                    </a>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── ESTOQUE ── */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-on-surface uppercase">Estoque</h2>
            <p className="text-on-surface-variant text-sm mt-0.5">{filtered.length} {filtered.length === 1 ? "veículo encontrado" : "veículos encontrados"}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setFiltersOpen(!filtersOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-surface-container-lowest rounded-xl text-sm font-bold shadow-sm">
              <Icon name="tune" className="text-lg" />Filtros
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-primary-container rounded-full text-[10px] font-black text-on-primary-container flex items-center justify-center">{activeFiltersCount}</span>
              )}
            </button>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="bg-surface-container-lowest border-0 rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm focus:ring-2 focus:ring-primary-container outline-none">
              <option value="createdAt_desc">Mais recentes</option>
              <option value="price_asc">Menor preço</option>
              <option value="price_desc">Maior preço</option>
              <option value="km_asc">Menor KM</option>
            </select>
          </div>
        </div>

        <div className="flex gap-8 items-start">

          {/* Sidebar desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <FilterPanel />
          </aside>

          {/* Mobile drawer */}
          {filtersOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
              <div className="relative ml-auto w-80 h-full bg-surface overflow-y-auto p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black text-lg uppercase tracking-tight">Filtros</h2>
                  <button onClick={() => setFiltersOpen(false)}><Icon name="close" className="text-xl" /></button>
                </div>
                <FilterPanel />
              </div>
            </div>
          )}

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Icon name="search_off" className="text-6xl text-outline mb-4" />
                <h3 className="font-bold text-lg text-on-surface mb-2">Nenhum veículo encontrado</h3>
                <p className="text-on-surface-variant text-sm mb-6">Tente ajustar os filtros para ver mais resultados.</p>
                {activeFiltersCount > 0 && (
                  <button onClick={resetFilters} className="bg-primary-container text-on-primary-container font-black px-8 py-3 rounded-full text-sm uppercase tracking-widest">
                    Limpar filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map(v => <VehicleCard key={v.id} v={v} />)}
              </div>
            )}

            <div className="mt-14 bg-surface-container-lowest rounded-2xl shadow-sm p-8 text-center">
              <Icon name="star_rate" className="text-3xl text-outline mb-3" />
              <p className="font-black text-on-surface-variant text-sm">Avaliações em breve</p>
              <p className="text-xs text-on-surface-variant mt-1">Os clientes poderão avaliar esta loja em uma próxima atualização.</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{label}</p>
      {children}
    </div>
  );
}

function ChipBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${active ? "bg-primary-container text-on-primary-container" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}>
      {label}
    </button>
  );
}

function VehicleCard({ v }: { v: Vehicle }) {
  const price = v.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
  const km    = v.km === 0 ? "0 km" : `${v.km.toLocaleString("pt-BR")} km`;
  const cover = v.photos[0]?.url ?? null;

  return (
    <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm flex flex-col group relative hover:shadow-md hover:-translate-y-0.5 transition-all">
      {v.boostLevel === "DESTAQUE" && (
        <span className="absolute top-3 right-3 z-10 text-[10px] font-black uppercase tracking-widest bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full">Destaque</span>
      )}
      {v.boostLevel === "ELITE" && (
        <span className="absolute top-3 right-3 z-10 text-[10px] font-black uppercase tracking-widest bg-inverse-surface text-inverse-on-surface px-2 py-0.5 rounded-full flex items-center gap-1">
          <Icon name="stars" className="text-yellow-400 text-[10px]" />Elite
        </span>
      )}
      <Link href={`/carro/${v.id}`} className="flex-1">
        <div className="h-44 overflow-hidden relative bg-surface-container">
          {cover
            ? <img src={cover} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            : <div className="w-full h-full flex items-center justify-center"><Icon name="directions_car" className="text-5xl text-outline" /></div>}
          {v.condition === "NEW" && (
            <div className="absolute top-3 left-3 bg-primary-container text-on-primary-container text-[10px] font-black px-2 py-1 uppercase rounded">0 km</div>
          )}
          {v.auction && (
            <div className="absolute top-3 left-3 bg-error text-white text-[10px] font-black px-2 py-1 uppercase rounded">Leilão</div>
          )}
          {v.armored && (
            <div className="absolute bottom-3 left-3 bg-black/70 text-white text-[10px] font-black px-2 py-1 uppercase rounded flex items-center gap-1">
              <Icon name="shield" className="text-xs" />Blindado
            </div>
          )}
        </div>
        <div className="p-5">
          <p className="text-xs font-black uppercase tracking-widest text-primary mb-0.5">{v.brand}</p>
          <h3 className="font-bold text-base text-on-surface leading-tight">{v.model}{v.version ? ` ${v.version}` : ""}</h3>
          <p className="text-xs text-on-surface-variant mt-1 mb-3">{v.yearFab}/{v.yearModel} · {km}</p>
          <p className="text-xl font-black text-on-surface">{price}</p>
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
      <div className="px-5 pb-5">
        <Link href={`/carro/${v.id}`} className="w-full block text-center bg-surface-container hover:bg-primary-container hover:text-on-primary-container text-on-surface font-bold py-2.5 rounded-full text-sm transition-colors">
          Ver anúncio
        </Link>
      </div>
    </div>
  );
}
