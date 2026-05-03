"use client";
import { useState, useEffect } from "react";
import ErpLayout from "@/components/erp/ErpLayout";
import ErpKpiCard from "@/components/erp/ErpKpiCard";
import ErpStatusBadge from "@/components/erp/ErpStatusBadge";
import Icon from "@/components/ui/Icon";
import Link from "next/link";

interface Vehicle {
  id: string; brand: string; model: string; version?: string; ano: number;
  price: number; km: number; status: string; photos: { url: string }[];
  createdAt: string;
}

export default function EstoquePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/vehicles/mine").then(r => r.json()).then(d => {
      setVehicles(d.vehicles ?? []);
      setLoading(false);
    });
  }, []);

  const filtered = filter === "ALL" ? vehicles : vehicles.filter(v => v.status === filter);
  const ativos   = vehicles.filter(v => v.status === "ACTIVE").length;
  const draft    = vehicles.filter(v => v.status === "DRAFT").length;
  const pausados = vehicles.filter(v => v.status === "PAUSED").length;

  return (
    <ErpLayout title="Estoque" subtitle="Todos os veículos cadastrados na sua loja">
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <ErpKpiCard label="Total" value={String(vehicles.length)} icon="inventory" />
        <ErpKpiCard label="Ativos" value={String(ativos)} icon="check_circle" accent={ativos > 0} />
        <ErpKpiCard label="Rascunho" value={String(draft)} icon="edit_note" />
        <ErpKpiCard label="Pausados" value={String(pausados)} icon="pause_circle" />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[{v:"ALL",l:"Todos"},{v:"ACTIVE",l:"Ativos"},{v:"DRAFT",l:"Rascunho"},{v:"PAUSED",l:"Pausados"},{v:"SOLD",l:"Vendidos"}].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className={`rounded-xl border px-3 py-1.5 text-sm font-bold transition ${filter === f.v ? "border-primary-container bg-primary-container/10 text-yellow-700" : "border-black/10 bg-white text-gray-500 hover:bg-gray-50"}`}>
            {f.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="h-8 w-8 rounded-full border-2 border-primary-container/30 border-t-primary-container animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Icon name="inventory" className="text-5xl text-gray-200 mb-4" />
          <p className="text-lg font-black text-gray-400">Nenhum veículo encontrado</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-black/10 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400 border-b border-black/10">
              <tr>
                {["Veículo","Ano","Preço","KM","Status","Cadastrado",""].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-black whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map(v => (
                <tr key={v.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4">
                    <Link href={`/vendas/estoque/${v.id}`} className="flex items-center gap-3 hover:opacity-80 transition">
                      {v.photos?.[0] ? (
                        <img src={v.photos[0].url} alt="" className="w-12 h-9 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <Icon name="directions_car" className="text-gray-300 text-sm" />
                        </div>
                      )}
                      <div>
                        <p className="font-black text-gray-900">{v.brand} {v.model}</p>
                        {v.version && <p className="text-xs text-gray-400">{v.version}</p>}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-gray-700">{v.ano}</td>
                  <td className="px-4 py-4 font-black text-gray-900">R$ {v.price?.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-4 text-gray-500">{v.km?.toLocaleString("pt-BR")} km</td>
                  <td className="px-4 py-4"><ErpStatusBadge status={v.status.toLowerCase()} /></td>
                  <td className="px-4 py-4 text-xs text-gray-400">{new Date(v.createdAt).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/vendas/estoque/${v.id}`}
                        className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-black text-gray-600 hover:bg-gray-50 transition whitespace-nowrap">
                        Ver ficha
                      </Link>
                      <Link href={`/vendas/veiculos/editar/${v.id}`}
                        className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-black text-gray-600 hover:bg-gray-50 transition">
                        Editar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ErpLayout>
  );
}
