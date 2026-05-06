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

  function handlePrint() {
    const w = window.open("", "_blank");
    if (!w) return;
    const rows = vehicles.map(v => `<tr>
      <td><strong>${v.brand} ${v.model}</strong>${v.version ? `<br/><span style="color:#999;font-size:10px">${v.version}</span>` : ""}</td>
      <td>${v.yearFab}</td>
      <td style="font-weight:900">R$ ${v.price?.toLocaleString("pt-BR")}</td>
      <td>${v.km?.toLocaleString("pt-BR")} km</td>
      <td>${new Date(v.updatedAt).toLocaleDateString("pt-BR")}</td>
    </tr>`).join("");
    w.document.write(`
      <html><head><title>Veículos Vendidos — ShopMotor</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:Arial,sans-serif; font-size:12px; color:#111; padding:24px; }
        h1 { font-size:17px; font-weight:900; text-transform:uppercase; margin-bottom:4px; }
        p.sub { font-size:11px; color:#888; margin-bottom:18px; }
        table { width:100%; border-collapse:collapse; }
        th { background:#f5f5f5; text-align:left; padding:8px 10px; font-size:10px; text-transform:uppercase; letter-spacing:.5px; color:#555; border-bottom:2px solid #e0e0e0; }
        td { padding:8px 10px; border-bottom:1px solid #eee; vertical-align:middle; }
        tr:nth-child(even) td { background:#fafafa; }
        .total { margin-top:16px; padding:10px 12px; background:#f5f5f5; border-radius:8px; display:flex; justify-content:space-between; font-size:12px; }
        footer { margin-top:20px; font-size:10px; color:#aaa; border-top:1px solid #eee; padding-top:8px; display:flex; justify-content:space-between; }
        @media print { body { padding:0; } }
      </style></head><body>
      <h1>ShopMotor — Veículos Vendidos</h1>
      <p class="sub">Gerado em ${new Date().toLocaleString("pt-BR")} &nbsp;·&nbsp; ${vehicles.length} veículo(s) vendido(s)</p>
      <table>
        <thead><tr><th>Veículo</th><th>Ano</th><th>Preço de venda</th><th>KM</th><th>Vendido em</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="total">
        <span>Receita total estimada</span>
        <strong>R$ ${totalReceita.toLocaleString("pt-BR")}</strong>
      </div>
      <footer><span>shopmotor.com.br</span><span>Total: ${vehicles.length} veículo(s)</span></footer>
      </body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 400);
  }

  return (
    <ErpLayout title="Vendidos" subtitle="Veículos marcados como vendidos"
      action={
        vehicles.length > 0 ? (
          <button onClick={handlePrint} className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-black text-gray-700 hover:bg-gray-50 transition">
            <Icon name="print" className="text-base" /> Imprimir relatório
          </button>
        ) : undefined
      }
    >
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
