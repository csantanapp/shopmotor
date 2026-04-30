"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AdBanner from "@/components/ads/AdBanner";
import AdCard from "@/components/ads/AdCard";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/context/AuthContext";

/* ── Types ── */
interface ApiVehicle {
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
  fuel: string;
  transmission: string;
  color: string;
  armored: boolean;
  auction: boolean;
  condition: "NEW" | "USED";
  boostLevel: "NONE" | "DESTAQUE" | "ELITE";
  photos: { url: string }[];
  previousPrice: number | null;
  fipePrice: number | null;
}

/* ── Static options ── */
const brandOptions = [
  "Todas","Aston Martin","Audi","Bentley","BMW","BYD","Cadillac","Caoa Changan","Caoa Chery",
  "Chevrolet","Chrysler","Citroën","Denza","Dodge","Effa","Ferrari","Fiat","Ford","Foton",
  "GAC","Geely","GMC","GWM","Honda","Hyundai","Iveco","JAC","Jaecoo","Jaguar","Jeep","Jetour",
  "Kia","Lamborghini","Land Rover","Leapmotor","Lexus","McLaren","Mercedes-Benz","MG","Mini",
  "Mitsubishi","Nissan","Omoda","Peugeot","Porsche","RAM","Renault","Riddara","Rolls-Royce",
  "Shineray","Tesla","Toyota","Volkswagen","Volvo","Zeekr","Outros",
];
const fuelOptions         = ["Todos","Flex","Gasolina","Diesel","Elétrico","Híbrido","GNV"];
const bodyOptions         = ["Todos","Hatch","Sedã","SUV/Crossover","Picape","Minivan","Esportivo","Conversível","Cupê","Van/Utilitário/Furgão","Buggy"];
const plateEndOptions     = ["1 e 2","3 e 4","5 e 6","7 e 8","9 e 0"];
const FILTER_FEATURES     = ["Ar condicionado","Airbag","Freio ABS","Carplay","Teto solar","Tração 4x4","IPVA Pago","Único dono","Garantia de fábrica","Direção hidráulica/elétrica","Sensor de estacionamento","Rodas liga leve","Piloto automático"];
const FILTER_MOTO_FEATURES = ["Aceito troca","Alienado","Garantia de fábrica","IPVA Pago","Licenciado","Revisões feitas pela concessionária","Único dono","Passagem por Leilão"];
const motoStyleOptions    = ["Ciclomotor","Custom","Esportiva","Naked","Off Road","Quadriciclo","Scooter","Street","Supermotard","Touring","Trail","Trial","Triciclo","Utilitária"];
const coolingOptions      = ["Ar","Líquida"];
const startTypeOptions    = ["Elétrica","Pedal","Pedal + Elétrica"];
const engineTypeOptions   = ["2 tempos","4 tempos","Elétrico de corrente contínua"];
const gearsOptions        = ["2","3","4","5","6","7","8","Automático"];
const brakeTypeOptions    = ["Disco/Disco","Disco/Tambor","Tambor/Disco","Tambor/Tambor"];
const motoNeedOptions     = ["Esportiva","Estrada","Fora-de-estrada","Lazer","Urbano"];
const transmissionOptions = ["Todos","Automático","Manual","CVT","Automatizado"];
const colorOptions        = ["Todas","Branco","Preto","Prata","Cinza","Vermelho","Azul","Verde","Amarelo","Laranja","Marrom","Bege","Dourado","Outro"];
const stateOptions = [
  { uf: "Todos", name: "Todos os estados" },
  { uf: "AC", name: "Acre" },{ uf: "AL", name: "Alagoas" },{ uf: "AP", name: "Amapá" },
  { uf: "AM", name: "Amazonas" },{ uf: "BA", name: "Bahia" },{ uf: "CE", name: "Ceará" },
  { uf: "DF", name: "Distrito Federal" },{ uf: "ES", name: "Espírito Santo" },
  { uf: "GO", name: "Goiás" },{ uf: "MA", name: "Maranhão" },{ uf: "MT", name: "Mato Grosso" },
  { uf: "MS", name: "Mato Grosso do Sul" },{ uf: "MG", name: "Minas Gerais" },
  { uf: "PA", name: "Pará" },{ uf: "PB", name: "Paraíba" },{ uf: "PR", name: "Paraná" },
  { uf: "PE", name: "Pernambuco" },{ uf: "PI", name: "Piauí" },
  { uf: "RJ", name: "Rio de Janeiro" },{ uf: "RN", name: "Rio Grande do Norte" },
  { uf: "RS", name: "Rio Grande do Sul" },{ uf: "RO", name: "Rondônia" },
  { uf: "RR", name: "Roraima" },{ uf: "SC", name: "Santa Catarina" },
  { uf: "SP", name: "São Paulo" },{ uf: "SE", name: "Sergipe" },{ uf: "TO", name: "Tocantins" },
];
const sortOptions = [
  { value: "createdAt_desc", label: "Mais recentes" },
  { value: "price_asc",      label: "Menor preço"  },
  { value: "price_desc",     label: "Maior preço"  },
  { value: "km_asc",         label: "Menor KM"     },
];
const CURRENT_YEAR = new Date().getFullYear();

/* ── Page ── */
export default function BuscaPage() {
  return <Suspense><BuscaPageInner /></Suspense>;
}

function BuscaPageInner() {
  const searchParams = useSearchParams();
  const [search, setSearch]             = useState(searchParams.get("q") ?? "");
  const [brand, setBrand]               = useState("Todas");
  const [fuel, setFuel]                 = useState("Todos");
  const [body, setBody]                 = useState("Todos");
  const [transmission, setTransmission] = useState("Todos");
  const [color, setColor]               = useState("Todas");
  const [state, setState]               = useState("Todos");
  const [priceMin, setPriceMin]         = useState("");
  const [priceMax, setPriceMax]         = useState("");
  const [kmMin, setKmMin]               = useState("");
  const [kmMax, setKmMax]               = useState("");
  const [yearMin, setYearMin]           = useState("");
  const [yearMax, setYearMax]           = useState("");
  const [condition, setCondition]       = useState("Todos");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("Todos");
  const [motoType, setMotoType]         = useState("Todos");
  const [cylinderccMin, setCylinderccMin] = useState("");
  const [cylinderccMax, setCylinderccMax] = useState("");
  const [armored, setArmored]           = useState(false);
  const [auction, setAuction]           = useState(false);
  const [plateEnd, setPlateEnd]         = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [coolingType, setCoolingType]   = useState("");
  const [startType, setStartType]       = useState("");
  const [engineType, setEngineType]     = useState("");
  const [gears, setGears]               = useState("");
  const [brakeType, setBrakeType]       = useState("");
  const [motoStyle, setMotoStyle]       = useState("Todos");
  const [motoNeed, setMotoNeed]         = useState("");
  const [sort, setSort]                 = useState("createdAt_desc");
  const [view, setView]                 = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen]   = useState(false);
  const [page, setPage]                 = useState(1);

  // API results
  const [vehicles, setVehicles] = useState<ApiVehicle[]>([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(0);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (authLoading || !user) return;
    fetch("/api/favorites/mine")
      .then(r => r.json())
      .then(d => setFavorites((d.favorites ?? []).map((f: { vehicleId: string }) => f.vehicleId)));
  }, [authLoading, user]);

  const toggleFav = async (id: string) => {
    if (!user) return;
    const isFav = favorites.includes(id);
    setFavorites(prev => isFav ? prev.filter(f => f !== id) : [...prev, id]);
    try {
      const res = isFav
        ? await fetch(`/api/favorites?vehicleId=${id}`, { method: "DELETE" })
        : await fetch("/api/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vehicleId: id }),
          });
      if (!res.ok) setFavorites(prev => isFav ? [...prev, id] : prev.filter(f => f !== id));
    } catch {
      setFavorites(prev => isFav ? [...prev, id] : prev.filter(f => f !== id));
    }
  };

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchVehicles = useCallback(async (currentPage: number) => {
    setFetching(true);
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("limit", "24");
    params.set("sort", sort);
    if (search)          params.set("q", search);
    if (brand !== "Todas") params.set("brand", brand);
    if (fuel !== "Todos")  params.set("fuel", fuel);
    if (body !== "Todos")  params.set("body", body);
    if (transmission !== "Todos") params.set("transmission", transmission);
    if (color !== "Todas") params.set("color", color);
    if (state !== "Todos") params.set("state", state);
    if (condition === "Novo")  params.set("condition", "Novo");
    if (condition === "Usado") params.set("condition", "Usado");
    if (vehicleTypeFilter === "CAR")  params.set("vehicleType", "CAR");
    if (vehicleTypeFilter === "MOTO") params.set("vehicleType", "MOTO");
    if (vehicleTypeFilter === "MOTO" && motoType !== "Todos") params.set("motoType", motoType);
    if (vehicleTypeFilter === "MOTO" && cylinderccMin) params.set("cylinderccMin", cylinderccMin);
    if (vehicleTypeFilter === "MOTO" && cylinderccMax) params.set("cylinderccMax", cylinderccMax);
    if (armored)     params.set("armored", "true");
    if (auction)     params.set("auction", "true");
    if (plateEnd)    params.set("plateEnd", plateEnd);
    if (coolingType) params.set("coolingType", coolingType);
    if (startType)   params.set("startType", startType);
    if (engineType)  params.set("engineType", engineType);
    if (gears)       params.set("gears", gears);
    if (brakeType)   params.set("brakeType", brakeType);
    if (motoStyle !== "Todos") params.set("motoStyle", motoStyle);
    if (motoNeed)    params.set("motoNeed", motoNeed);
    selectedFeatures.forEach(f => params.append("feature", f));
    if (priceMin) params.set("priceMin", priceMin.replace(/\D/g, ""));
    if (priceMax) params.set("priceMax", priceMax.replace(/\D/g, ""));
    if (kmMin)    params.set("kmMin", kmMin.replace(/\D/g, ""));
    if (kmMax)    params.set("kmMax", kmMax.replace(/\D/g, ""));
    if (yearMin)  params.set("yearMin", yearMin);
    if (yearMax)  params.set("yearMax", yearMax);

    try {
      const res = await fetch(`/api/vehicles?${params}`);
      if (res.ok) {
        const data = await res.json();
        setVehicles(data.vehicles);
        setTotal(data.total);
        setPages(data.pages);
        setFetchError(false);
      } else {
        setFetchError(true);
      }
    } catch {
      setFetchError(true);
    }
    setFetching(false);
  }, [search, brand, fuel, body, transmission, color, state, condition, vehicleTypeFilter, motoType, cylinderccMin, cylinderccMax, armored, auction, plateEnd, selectedFeatures, coolingType, startType, engineType, gears, brakeType, motoStyle, motoNeed, priceMin, priceMax, kmMin, kmMax, yearMin, yearMax, sort]);

  // Reset page and debounce fetch when filters change
  useEffect(() => {
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchVehicles(1), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [fetchVehicles]);

  // Fetch on page change (no debounce)
  useEffect(() => {
    if (page > 1) fetchVehicles(page);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const resetFilters = () => {
    setBrand("Todas"); setFuel("Todos"); setBody("Todos"); setTransmission("Todos");
    setColor("Todas"); setState("Todos"); setCondition("Todos"); setPriceMin(""); setPriceMax("");
    setKmMin(""); setKmMax(""); setYearMin(""); setYearMax("");
    setArmored(false); setAuction(false); setSearch(""); setVehicleTypeFilter("Todos");
    setMotoType("Todos"); setCylinderccMin(""); setCylinderccMax("");
    setPlateEnd(""); setSelectedFeatures([]);
    setCoolingType(""); setStartType(""); setEngineType(""); setGears("");
    setBrakeType(""); setMotoStyle("Todos"); setMotoNeed("");
  };

  const activeFiltersCount = [
    brand !== "Todas", fuel !== "Todos", body !== "Todos", transmission !== "Todos",
    color !== "Todas", state !== "Todos", condition !== "Todos", !!priceMin, !!priceMax,
    !!kmMin, !!kmMax, !!yearMin, !!yearMax, armored, auction,
    motoType !== "Todos", !!cylinderccMin, !!cylinderccMax,
    !!plateEnd, selectedFeatures.length > 0,
    !!coolingType, !!startType, !!engineType, !!gears, !!brakeType,
    motoStyle !== "Todos", !!motoNeed,
  ].filter(Boolean).length;

  /* ── Filter panel ── */
  const FilterPanel = () => (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Marca, modelo..."
          className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border-0 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-primary-container outline-none"
        />
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
            {[
              { value: "CAR",  label: "Carros", icon: "directions_car" },
              { value: "MOTO", label: "Motos",  icon: "two_wheeler" },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setVehicleTypeFilter(v => v === opt.value ? "Todos" : opt.value)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${vehicleTypeFilter === opt.value ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant hover:bg-surface-container"}`}
              >
                <Icon name={opt.icon} className="text-base" />
                {opt.label}
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
          <>
            <FilterSection label="Estilo">
              <div className="flex flex-wrap gap-1.5">
                {["Todos",...motoStyleOptions].map(t => <ChipBtn key={t} label={t} active={motoStyle === t} onClick={() => setMotoStyle(t)} />)}
              </div>
            </FilterSection>

            <FilterSection label="Cilindrada (cc)">
              <div className="grid grid-cols-2 gap-2">
                <input type="number" value={cylinderccMin} onChange={e => setCylinderccMin(e.target.value)} placeholder="Mín." className={inputCls} />
                <input type="number" value={cylinderccMax} onChange={e => setCylinderccMax(e.target.value)} placeholder="Máx." className={inputCls} />
              </div>
            </FilterSection>

            <FilterSection label="Tipo de motor">
              <div className="flex flex-wrap gap-1.5">
                {engineTypeOptions.map(o => <ChipBtn key={o} label={o} active={engineType === o} onClick={() => setEngineType(p => p === o ? "" : o)} />)}
              </div>
            </FilterSection>

            <FilterSection label="Tipo de refrigeração">
              <div className="flex gap-2">
                {coolingOptions.map(o => <ChipBtn key={o} label={o} active={coolingType === o} onClick={() => setCoolingType(p => p === o ? "" : o)} />)}
              </div>
            </FilterSection>

            <FilterSection label="Tipo de partida">
              <div className="flex flex-wrap gap-1.5">
                {startTypeOptions.map(o => <ChipBtn key={o} label={o} active={startType === o} onClick={() => setStartType(p => p === o ? "" : o)} />)}
              </div>
            </FilterSection>

            <FilterSection label="Número de marchas">
              <div className="flex flex-wrap gap-1.5">
                {gearsOptions.map(o => <ChipBtn key={o} label={o} active={gears === o} onClick={() => setGears(p => p === o ? "" : o)} />)}
              </div>
            </FilterSection>

            <FilterSection label="Freio dianteiro/traseiro">
              <div className="flex flex-wrap gap-1.5">
                {brakeTypeOptions.map(o => <ChipBtn key={o} label={o} active={brakeType === o} onClick={() => setBrakeType(p => p === o ? "" : o)} />)}
              </div>
            </FilterSection>

            <FilterSection label="Necessidade">
              <div className="flex flex-wrap gap-1.5">
                {motoNeedOptions.map(o => <ChipBtn key={o} label={o} active={motoNeed === o} onClick={() => setMotoNeed(p => p === o ? "" : o)} />)}
              </div>
            </FilterSection>

            <FilterSection label="Características">
              <div className="space-y-2">
                {FILTER_MOTO_FEATURES.map(feat => (
                  <label key={feat} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(feat)}
                      onChange={() => setSelectedFeatures(prev => prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat])}
                      className="w-4 h-4 accent-yellow-500 rounded"
                    />
                    <span className="text-sm text-on-surface">{feat}</span>
                  </label>
                ))}
              </div>
            </FilterSection>
          </>
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

        <FilterSection label="Estado">
          <select value={state} onChange={e => setState(e.target.value)} className={selectCls}>
            {stateOptions.map(s => <option key={s.uf} value={s.uf}>{s.uf === "Todos" ? "Todos os estados" : `${s.uf} — ${s.name}`}</option>)}
          </select>
        </FilterSection>

        {vehicleTypeFilter !== "MOTO" && (
          <FilterSection label="Final da placa">
            <div className="flex flex-wrap gap-1.5">
              {plateEndOptions.map(opt => (
                <ChipBtn key={opt} label={opt} active={plateEnd === opt} onClick={() => setPlateEnd(p => p === opt ? "" : opt)} />
              ))}
            </div>
          </FilterSection>
        )}

        {vehicleTypeFilter !== "MOTO" && (
          <>
            <FilterSection label="Opcionais">
              <div className="space-y-2">
                {FILTER_FEATURES.map(feat => (
                  <label key={feat} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(feat)}
                      onChange={() => setSelectedFeatures(prev => prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat])}
                      className="w-4 h-4 accent-yellow-500 rounded"
                    />
                    <span className="text-sm text-on-surface">{feat}</span>
                  </label>
                ))}
              </div>
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
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-on-surface uppercase">Busca</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">
            {fetching ? "Buscando..." : `${total} ${total === 1 ? "veículo encontrado" : "veículos encontrados"}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-surface-container-lowest rounded-xl text-sm font-bold shadow-sm"
          >
            <Icon name="tune" className="text-lg" />Filtros
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 bg-primary-container rounded-full text-[10px] font-black text-on-primary-container flex items-center justify-center">{activeFiltersCount}</span>
            )}
          </button>

          <select value={sort} onChange={e => setSort(e.target.value)} className="bg-surface-container-lowest border-0 rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm focus:ring-2 focus:ring-primary-container outline-none">
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <div className="flex bg-surface-container-lowest rounded-xl shadow-sm p-1 gap-1">
            <button onClick={() => setView("grid")} className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-primary-container text-on-primary-container" : "text-outline hover:text-on-surface"}`}>
              <Icon name="grid_view" className="text-lg" />
            </button>
            <button onClick={() => setView("list")} className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-primary-container text-on-primary-container" : "text-outline hover:text-on-surface"}`}>
              <Icon name="view_list" className="text-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {condition !== "Todos"     && <Chip label={condition}    onRemove={() => setCondition("Todos")} />}
          {brand !== "Todas"         && <Chip label={brand}        onRemove={() => setBrand("Todas")} />}
          {fuel  !== "Todos"         && <Chip label={fuel}         onRemove={() => setFuel("Todos")} />}
          {body  !== "Todos"         && <Chip label={body}         onRemove={() => setBody("Todos")} />}
          {transmission !== "Todos"  && <Chip label={transmission} onRemove={() => setTransmission("Todos")} />}
          {color !== "Todas"         && <Chip label={color}        onRemove={() => setColor("Todas")} />}
          {state !== "Todos"         && <Chip label={state}        onRemove={() => setState("Todos")} />}
          {priceMin                  && <Chip label={`Preço ≥ R$ ${priceMin}`} onRemove={() => setPriceMin("")} />}
          {priceMax                  && <Chip label={`Preço ≤ R$ ${priceMax}`} onRemove={() => setPriceMax("")} />}
          {kmMin                     && <Chip label={`KM ≥ ${kmMin}`}         onRemove={() => setKmMin("")} />}
          {kmMax                     && <Chip label={`KM ≤ ${kmMax}`}         onRemove={() => setKmMax("")} />}
          {yearMin                   && <Chip label={`Ano ≥ ${yearMin}`}      onRemove={() => setYearMin("")} />}
          {yearMax                   && <Chip label={`Ano ≤ ${yearMax}`}      onRemove={() => setYearMax("")} />}
          {armored                   && <Chip label="Blindado"                onRemove={() => setArmored(false)} />}
          {auction                   && <Chip label="Leilão"                  onRemove={() => setAuction(false)} />}
          {motoType !== "Todos"      && <Chip label={motoType}               onRemove={() => setMotoType("Todos")} />}
          {cylinderccMin             && <Chip label={`Cilindrada ≥ ${cylinderccMin}cc`} onRemove={() => setCylinderccMin("")} />}
          {cylinderccMax             && <Chip label={`Cilindrada ≤ ${cylinderccMax}cc`} onRemove={() => setCylinderccMax("")} />}
          {plateEnd                  && <Chip label={`Final ${plateEnd}`} onRemove={() => setPlateEnd("")} />}
          {motoStyle !== "Todos"     && <Chip label={motoStyle}          onRemove={() => setMotoStyle("Todos")} />}
          {engineType                && <Chip label={engineType}         onRemove={() => setEngineType("")} />}
          {coolingType               && <Chip label={`Refrig. ${coolingType}`} onRemove={() => setCoolingType("")} />}
          {startType                 && <Chip label={`Partida ${startType}`}   onRemove={() => setStartType("")} />}
          {gears                     && <Chip label={`${gears} marchas`} onRemove={() => setGears("")} />}
          {brakeType                 && <Chip label={`Freio ${brakeType}`}     onRemove={() => setBrakeType("")} />}
          {motoNeed                  && <Chip label={motoNeed}           onRemove={() => setMotoNeed("")} />}
          {selectedFeatures.map(f   => <Chip key={f} label={f} onRemove={() => setSelectedFeatures(prev => prev.filter(x => x !== f))} />)}
        </div>
      )}

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

        {/* Results */}
        <div className="flex-1 min-w-0 space-y-6">
          <AdBanner slot="busca_banner" maxHeight={150} />
          {fetching ? (
            <div className="flex items-center justify-center py-24">
              <span className="w-10 h-10 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Icon name="wifi_off" className="text-6xl text-outline mb-4" />
              <h3 className="font-bold text-lg text-on-surface mb-2">Erro ao carregar anúncios</h3>
              <p className="text-on-surface-variant text-sm mb-6">Verifique sua conexão e tente novamente.</p>
              <button onClick={() => fetchVehicles(page)} className="bg-primary-container text-on-primary-container font-black px-8 py-3 rounded-full text-sm uppercase tracking-widest">
                Tentar novamente
              </button>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Icon name="search_off" className="text-6xl text-outline mb-4" />
              <h3 className="font-bold text-lg text-on-surface mb-2">Nenhum veículo encontrado</h3>
              <p className="text-on-surface-variant text-sm mb-6">Tente ajustar os filtros para ver mais resultados.</p>
              <button onClick={resetFilters} className="bg-primary-container text-on-primary-container font-black px-8 py-3 rounded-full text-sm uppercase tracking-widest">
                Limpar filtros
              </button>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {vehicles.slice(0, 8).map(v => <GridCard key={v.id} v={v} fav={favorites.includes(v.id)} onFav={() => toggleFav(v.id)} />)}
              <AdCard slot="busca_card" />
              {vehicles.slice(8).map(v => <GridCard key={v.id} v={v} fav={favorites.includes(v.id)} onFav={() => toggleFav(v.id)} />)}
            </div>
          ) : (
            <div className="space-y-4">
              {vehicles.slice(0, 8).map(v => <ListCard key={v.id} v={v} fav={favorites.includes(v.id)} onFav={() => toggleFav(v.id)} />)}
              {vehicles.length > 8 && <AdBanner slot="busca_banner" maxHeight={150} />}
              {vehicles.slice(8).map(v => <ListCard key={v.id} v={v} fav={favorites.includes(v.id)} onFav={() => toggleFav(v.id)} />)}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-full hover:bg-surface-container-high transition-colors disabled:opacity-40"
              >
                <Icon name="chevron_left" className="text-xl" />
              </button>

              {Array.from({ length: pages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === pages || Math.abs(p - page) <= 2)
                .map((p, idx, arr) => (
                  <span key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-outline px-1">…</span>}
                    <button
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-full text-sm font-bold transition-colors ${p === page ? "bg-primary-container text-on-primary-container" : "hover:bg-surface-container-high text-on-surface-variant"}`}
                    >
                      {p}
                    </button>
                  </span>
                ))
              }

              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="p-2 rounded-full hover:bg-surface-container-high transition-colors disabled:opacity-40"
              >
                <Icon name="chevron_right" className="text-xl" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ── */
const selectCls = "w-full bg-surface-container-low border-0 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary-container outline-none";
const inputCls  = "w-full bg-surface-container-low border-0 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary-container outline-none placeholder:text-outline";

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
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${active ? "bg-primary-container text-on-primary-container" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}
    >
      {label}
    </button>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1.5 px-3 py-1 bg-primary-container/20 text-on-surface rounded-full text-xs font-bold">
      {label}
      <button onClick={onRemove} className="hover:text-error transition-colors">
        <Icon name="close" className="text-sm" />
      </button>
    </span>
  );
}

type CardProps = { v: ApiVehicle; fav: boolean; onFav: () => void };

function BoostBadge({ level }: { level: ApiVehicle["boostLevel"] }) {
  if (level === "DESTAQUE") return (
    <span className="absolute top-3 right-10 z-10 text-[10px] font-black uppercase tracking-widest bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full">
      Destaque
    </span>
  );
  if (level === "ELITE") return (
    <span className="absolute top-3 right-10 z-10 text-[10px] font-black uppercase tracking-widest bg-inverse-surface text-inverse-on-surface px-2 py-0.5 rounded-full flex items-center gap-1">
      <Icon name="stars" className="text-yellow-400 text-[10px]" />Elite
    </span>
  );
  return null;
}

function boostBorder(level: ApiVehicle["boostLevel"]) {
  if (level === "DESTAQUE") return "border-2 border-primary-container";
  if (level === "ELITE")    return "border-2 border-inverse-surface";
  return "";
}


function GridCard({ v, fav, onFav }: CardProps) {
  const price    = v.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
  const km       = v.km === 0 ? "0 km" : `${v.km.toLocaleString("pt-BR")} km`;
  const coverUrl = v.photos[0]?.url ?? null;

  return (
    <div className={`bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm group relative flex flex-col ${boostBorder(v.boostLevel)}`}>
      <BoostBadge level={v.boostLevel} />
      <button onClick={onFav} aria-label={fav ? "Remover dos favoritos" : "Favoritar"} className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/60 transition-colors">
        <Icon name="favorite" fill={fav} className={`text-sm ${fav ? "text-red-400" : "text-white"}`} />
      </button>
      <Link href={`/carro/${v.id}`} className="flex-1">
        <div className="h-44 overflow-hidden relative bg-surface-container">
          {coverUrl ? (
            <img src={coverUrl} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon name="directions_car" className="text-5xl text-outline" />
            </div>
          )}
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
          <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">{v.brand}</p>
          <h3 className="font-bold text-base leading-tight text-on-surface mb-1">{v.model}{v.version ? ` ${v.version}` : ""}</h3>
          <p className="text-xs text-on-surface-variant mb-3">{v.yearFab}/{v.yearModel} · {km}</p>
          <p className="text-xl font-black text-on-surface">{price}</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {v.previousPrice && v.previousPrice > v.price && (
              <span className="flex items-center gap-1 text-[10px] font-black text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                <Icon name="trending_down" className="text-xs" />Baixou o preço
              </span>
            )}
            {v.fipePrice && v.fipePrice > 0 && v.price < v.fipePrice && (
              <span className="flex items-center gap-1 text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                <Icon name="verified" className="text-xs" />Abaixo da FIPE
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-on-surface-variant mt-2">
            <Icon name="location_on" className="text-sm" />{v.city}, {v.state}
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

function ListCard({ v, fav, onFav }: CardProps) {
  const price    = v.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
  const km       = v.km === 0 ? "0 km" : `${v.km.toLocaleString("pt-BR")} km`;
  const coverUrl = v.photos[0]?.url ?? null;

  return (
    <div className={`bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm flex group relative ${boostBorder(v.boostLevel)}`}>
      {v.boostLevel !== "NONE" && (
        <span className={`absolute top-3 left-3 z-10 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 ${v.boostLevel === "ELITE" ? "bg-inverse-surface text-inverse-on-surface" : "bg-primary-container text-on-primary-container"}`}>
          {v.boostLevel === "ELITE" && <Icon name="stars" className="text-yellow-400 text-[10px]" />}
          {v.boostLevel === "ELITE" ? "Elite" : "Destaque"}
        </span>
      )}
      <Link href={`/carro/${v.id}`} className="w-56 flex-shrink-0 relative overflow-hidden bg-surface-container">
        {coverUrl ? (
          <img src={coverUrl} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center min-h-[140px]">
            <Icon name="directions_car" className="text-5xl text-outline" />
          </div>
        )}
        {v.auction && (
          <div className="absolute top-3 left-3 bg-error text-white text-[10px] font-black px-2 py-1 uppercase rounded">Leilão</div>
        )}
      </Link>
      <div className="flex-1 p-6 flex flex-col justify-between min-w-0">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-primary mb-0.5">{v.brand}</p>
          <h3 className="font-bold text-lg leading-tight text-on-surface mb-1">{v.model}{v.version ? ` ${v.version}` : ""}</h3>
          <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-on-surface-variant">
            <span>{v.yearFab}/{v.yearModel}</span><span>·</span>
            <span>{km}</span><span>·</span>
            <span>{v.fuel}</span><span>·</span>
            <span>{v.transmission}</span>
            {v.color && <><span>·</span><span>{v.color}</span></>}
            {v.armored && <><span>·</span><span className="font-bold text-on-surface flex items-center gap-0.5"><Icon name="shield" className="text-xs" />Blindado</span></>}
          </div>
          <div className="flex items-center gap-1 text-xs text-on-surface-variant mt-1">
            <Icon name="location_on" className="text-sm" />{v.city}, {v.state}
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-2xl font-black text-on-surface">{price}</p>
            <div className="flex flex-wrap gap-1.5">
              {v.previousPrice && v.previousPrice > v.price && (
                <span className="flex items-center gap-1 text-[10px] font-black text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  <Icon name="trending_down" className="text-xs" />Baixou o preço
                </span>
              )}
              {v.fipePrice && v.fipePrice > 0 && v.price < v.fipePrice && (
                <span className="flex items-center gap-1 text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  <Icon name="verified" className="text-xs" />Abaixo da FIPE
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onFav} aria-label={fav ? "Remover dos favoritos" : "Favoritar"} className="p-2 rounded-full border border-outline-variant hover:bg-surface-container-high transition-colors">
              <Icon name="favorite" fill={fav} className={`text-lg ${fav ? "text-red-400" : "text-outline"}`} />
            </button>
            <Link href={`/carro/${v.id}`} className="bg-primary-container text-on-primary-container font-black px-6 py-2 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all">
              Ver anúncio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
