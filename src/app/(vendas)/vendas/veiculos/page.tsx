"use client";

import { useState, useEffect } from "react";
import ErpLayout from "@/components/erp/ErpLayout";
import ErpStatusBadge from "@/components/erp/ErpStatusBadge";
import Icon from "@/components/ui/Icon";
import Image from "next/image";
import Link from "next/link";

type VehicleStatus = "ACTIVE" | "DRAFT" | "SOLD" | "PAUSED" | "EXPIRED";

interface ApiVehicle {
  id: string;
  brand: string;
  model: string;
  version?: string;
  yearFab: number;
  yearModel: number;
  price: number;
  fipePrice?: number;
  status: VehicleStatus;
  createdAt: string;
  views: number;
  km: number;
  boostLevel: string;
  photos: { url: string; isCover: boolean }[];
}

const statusMap: Record<VehicleStatus, string> = {
  ACTIVE:  "ativo",
  DRAFT:   "pausado",
  SOLD:    "vendido",
  PAUSED:  "pausado",
  EXPIRED: "pausado",
};

function daysInStock(createdAt: string) {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000);
}

function scoreFromVehicle(v: ApiVehicle): number {
  let s = 0;
  if (v.status === "ACTIVE") s += 30;
  if (v.photos.length >= 8) s += 25;
  else if (v.photos.length >= 4) s += 15;
  else if (v.photos.length >= 1) s += 5;
  if (v.fipePrice && v.price <= v.fipePrice) s += 25;
  else if (v.fipePrice) s += 10;
  if (v.views >= 500) s += 20;
  else if (v.views >= 100) s += 12;
  else if (v.views >= 20) s += 6;
  return Math.min(100, s);
}

function scoreSuggestions(v: ApiVehicle, score: number): string[] {
  const s: string[] = [];
  if (v.photos.length < 6) s.push("fotos");
  if (v.fipePrice && v.price > v.fipePrice * 1.02) s.push("preco");
  if (score < 60 && v.status === "ACTIVE") s.push("impulsionar");
  return s;
}

const scoreLabel = (s: number) =>
  s >= 80 ? { label: "Alta chance", cls: "bg-green-100 text-green-700 border-green-300" }
  : s >= 50 ? { label: "Média chance", cls: "bg-yellow-100 text-yellow-700 border-yellow-300" }
  : { label: "Baixa chance", cls: "bg-red-100 text-red-600 border-red-300" };

const suggMap: Record<string, { label: string; icon: string }> = {
  impulsionar: { label: "Impulsionar", icon: "rocket_launch" },
  fotos:       { label: "Melhorar fotos", icon: "photo_camera" },
  preco:       { label: "Ajustar preço", icon: "sell" },
};

export default function VeiculosPage() {
  const [vehicles, setVehicles] = useState<ApiVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [toast, setToast] = useState("");

  const fire = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    fetch("/api/vehicles/mine")
      .then(r => r.json())
      .then(d => setVehicles(d.vehicles ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = vehicles.filter(v => {
    const q = search.toLowerCase();
    const matchQ = !q || `${v.brand} ${v.model} ${v.version ?? ""}`.toLowerCase().includes(q);
    const matchS = filterStatus === "todos" || v.status === filterStatus;
    return matchQ && matchS;
  });

  return (
    <ErpLayout
      title="Gestão de Veículos"
      subtitle={`${vehicles.length} veículo${vehicles.length !== 1 ? "s" : ""} no seu estoque`}
      action={
        <Link href="/perfil/anunciar" className="flex items-center gap-2 rounded-xl bg-primary-container px-4 py-2 text-sm font-black text-black hover:opacity-90 transition">
          <Icon name="add" className="text-base" /> Cadastrar veículo
        </Link>
      }
    >
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-2xl">{toast}</div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 flex-1 min-w-64">
          <Icon name="search" className="text-sm text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por marca, modelo…"
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>
        {[
          { label: "Todos", val: "todos" },
          { label: "Ativos", val: "ACTIVE" },
          { label: "Rascunho", val: "DRAFT" },
          { label: "Vendidos", val: "SOLD" },
          { label: "Pausados", val: "PAUSED" },
        ].map(f => (
          <button
            key={f.val}
            onClick={() => setFilterStatus(f.val)}
            className={`rounded-xl border px-3 py-2 text-sm font-bold transition ${filterStatus === f.val ? "border-primary-container bg-primary-container/10 text-yellow-700" : "border-black/10 bg-white text-gray-500 hover:bg-gray-50"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <span className="h-8 w-8 rounded-full border-2 border-primary-container/30 border-t-primary-container animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Icon name="directions_car" className="text-5xl text-gray-200 mb-4" />
          <p className="text-lg font-black text-gray-400">Nenhum veículo encontrado</p>
          <p className="text-sm text-gray-400 mt-1">
            {vehicles.length === 0 ? "Cadastre seu primeiro veículo para começar a vender." : "Tente ajustar os filtros."}
          </p>
          {vehicles.length === 0 && (
            <Link href="/perfil/anunciar" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-container px-5 py-2.5 text-sm font-black text-black hover:opacity-90">
              <Icon name="add" className="text-base" /> Cadastrar agora
            </Link>
          )}
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(v => {
            const score = scoreFromVehicle(v);
            const sl = scoreLabel(score);
            const suggestions = scoreSuggestions(v, score);
            const days = daysInStock(v.createdAt);
            const cover = v.photos.find(p => p.isCover)?.url ?? v.photos[0]?.url;
            const statusKey = statusMap[v.status] ?? "pausado";

            return (
              <div key={v.id} className="rounded-xl border border-black/10 bg-white p-5 flex flex-col shadow-sm">
                {/* Imagem */}
                <div className="relative h-40 w-full rounded-lg overflow-hidden bg-gray-100 mb-4">
                  {cover ? (
                    <Image src={cover} alt={`${v.brand} ${v.model}`} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Icon name="directions_car" className="text-4xl text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <ErpStatusBadge status={statusKey} />
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-black text-gray-900 truncate">{v.brand} {v.model}</h3>
                    <p className="text-xs text-gray-400">{v.version ? `${v.version} · ` : ""}{v.yearFab}/{v.yearModel} · {v.km.toLocaleString("pt-BR")} km</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{days}d em estoque</span>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <p className="text-xl font-black text-gray-900">R$ {v.price.toLocaleString("pt-BR")}</p>
                  {v.fipePrice && (
                    <p className="text-[11px] text-gray-400">FIPE R$ {v.fipePrice.toLocaleString("pt-BR")}</p>
                  )}
                </div>

                {/* Score */}
                <div className="mt-4 rounded-lg border border-black/10 bg-gray-50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">Score de venda</p>
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${sl.cls}`}>{sl.label}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-gray-900">{score}</span>
                    <span className="text-xs text-gray-400">/100</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200">
                    <div className="h-full rounded-full bg-primary-container transition-all" style={{ width: `${score}%` }} />
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {[
                      { label: "Fotos", value: Math.min(100, Math.round((v.photos.length / 10) * 100)) },
                      { label: "Preço vs FIPE", value: v.fipePrice ? Math.min(100, Math.round((v.fipePrice / v.price) * 100)) : 50 },
                      { label: "Visibilidade", value: Math.min(100, Math.round((v.views / 500) * 100)) },
                    ].map(b => (
                      <li key={b.label} className="flex items-center gap-2 text-[11px]">
                        <span className="w-24 text-gray-400">{b.label}</span>
                        <div className="h-1 flex-1 rounded-full bg-gray-200">
                          <div className="h-full rounded-full bg-yellow-400" style={{ width: `${b.value}%` }} />
                        </div>
                        <span className="w-7 text-right font-bold text-gray-700">{b.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-gray-50 border border-black/5 py-2">
                    <Icon name="visibility" className="text-sm text-gray-400 mx-auto block" />
                    <p className="mt-0.5 text-sm font-black text-gray-900">{v.views.toLocaleString("pt-BR")}</p>
                    <p className="text-[10px] text-gray-400 uppercase">Views</p>
                  </div>
                  <div className="rounded-md bg-gray-50 border border-black/5 py-2">
                    <Icon name="photo_library" className="text-sm text-gray-400 mx-auto block" />
                    <p className="mt-0.5 text-sm font-black text-gray-900">{v.photos.length}</p>
                    <p className="text-[10px] text-gray-400 uppercase">Fotos</p>
                  </div>
                  <div className="rounded-md bg-gray-50 border border-black/5 py-2">
                    <Icon name="rocket_launch" className="text-sm text-gray-400 mx-auto block" />
                    <p className="mt-0.5 text-sm font-black text-gray-900 capitalize">{v.boostLevel === "NONE" ? "—" : v.boostLevel.toLowerCase()}</p>
                    <p className="text-[10px] text-gray-400 uppercase">Impulso</p>
                  </div>
                </div>

                {/* Ações */}
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/carro/${v.id}`}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-black/10 py-2 text-xs font-black text-gray-600 hover:bg-gray-50 transition"
                  >
                    <Icon name="visibility" className="text-xs" /> Ver anúncio
                  </Link>
                  <Link
                    href={`/perfil/editar/${v.id}`}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-black/10 py-2 text-xs font-black text-gray-600 hover:bg-gray-50 transition"
                  >
                    <Icon name="edit" className="text-xs" /> Editar
                  </Link>
                </div>

                {/* Sugestões */}
                {suggestions.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[11px] font-black uppercase tracking-wider text-yellow-700 mb-2">Sugestões automáticas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestions.map(s => {
                        const sg = suggMap[s];
                        return (
                          <button key={s} onClick={() => fire(`Ação: ${sg.label}`)} className="inline-flex items-center gap-1 rounded-md bg-primary-container px-2.5 py-1 text-[11px] font-black text-black hover:opacity-90">
                            <Icon name={sg.icon} className="text-xs" /> {sg.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </ErpLayout>
  );
}
