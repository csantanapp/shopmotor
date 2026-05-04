"use client";
import { useState, useEffect } from "react";
import ErpLayout from "@/components/erp/ErpLayout";
import ErpKpiCard from "@/components/erp/ErpKpiCard";
import Icon from "@/components/ui/Icon";
import Link from "next/link";

interface Vehicle {
  id: string; brand: string; model: string; version?: string;
  yearFab: number; price: number; km: number; updatedAt: string;
  photos: { url: string }[];
  status: string;
}

export default function VendidosPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch("/api/vehicles/mine").then(r => r.json()).then(d => {
      setVehicles((d.vehicles ?? []).filter((v: Vehicle) => v.status === "SOLD"));
      setLoading(false);
    });
  }, []);

  const totalReceita = vehicles.reduce((s, v) => s + (v.price ?? 0), 0);
  const ticketMedio  = vehicles.length > 0 ? Math.round(totalReceita / vehicles.length) : 0;

  return (
    <ErpLayout title="Vendidos" subtitle="Veículos marcados como vendidos">
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <ErpKpiCard label="Total vendido" value={String(vehicles.length)} icon="sell" accent={vehicles.length > 0} />
        <ErpKpiCard label="Receita estimada" value={`R$ ${totalReceita.toLocaleString("pt-BR")}`} icon="payments" />
        <ErpKpiCard label="Ticket médio" value={`R$ ${ticketMedio.toLocaleString("pt-BR")}`} icon="trending_up" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="h-8 w-8 rounded-full border-2 border-primary-container/30 border-t-primary-container animate-spin" />
        </div>
      ) : vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Icon name="sell" className="text-5xl text-gray-200 mb-4" />
          <p className="text-lg font-black text-gray-400">Nenhum veículo vendido ainda</p>
          <p className="text-sm text-gray-400 mt-1">Quando marcar um veículo como vendido ele aparecerá aqui.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-black/10 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400 border-b border-black/10">
              <tr>
                {["Veículo","Ano","Preço de venda","KM","Vendido em",""].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-black whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {vehicles.map(v => (
                <tr key={v.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4">
                    <Link href={`/vendas/vendidos/${v.id}`} className="flex items-center gap-3 hover:opacity-80 transition">
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
                  <td className="px-4 py-4 text-gray-700">{v.yearFab}</td>
                  <td className="px-4 py-4 font-black text-gray-900">R$ {v.price?.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-4 text-gray-500">{v.km?.toLocaleString("pt-BR")} km</td>
                  <td className="px-4 py-4 text-xs text-gray-400">{new Date(v.updatedAt).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-4">
                    <Link href={`/vendas/vendidos/${v.id}`}
                      className="flex items-center gap-1 rounded-lg border border-black/10 px-3 py-1.5 text-xs font-black text-gray-600 hover:bg-gray-50 transition">
                      <Icon name="visibility" className="text-xs" /> Ver ficha
                    </Link>
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
