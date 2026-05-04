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

const EMPTY_BUYER = { buyerNome: "", buyerDocumento: "", buyerTelefone: "", buyerEmail: "", observacao: "", soldAt: "" };

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
}

const iCls = "w-full border border-black/10 bg-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none";

export default function EstoquePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("ALL");
  const [selling, setSelling]   = useState(false);
  const [toast, setToast]       = useState("");

  /* vender modal */
  const [venderId, setVenderId]   = useState<string | null>(null);
  const [buyer, setBuyer]         = useState({ ...EMPTY_BUYER });

  function fire(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }
  function setB(k: string, v: string) { setBuyer(b => ({ ...b, [k]: v })); }

  useEffect(() => {
    fetch("/api/vehicles/mine").then(r => r.json()).then(d => {
      setVehicles(d.vehicles ?? []);
      setLoading(false);
    });
  }, []);

  async function handleVender() {
    if (!venderId) return;
    setSelling(true);
    const res = await fetch(`/api/vehicles/${venderId}/vender`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buyer),
    });
    setSelling(false);
    if (res.ok) {
      setVehicles(vs => vs.map(v => v.id === venderId ? { ...v, status: "SOLD" } : v));
      fire("Venda registrada com sucesso!");
      setVenderId(null);
      setBuyer({ ...EMPTY_BUYER });
    } else {
      fire("Erro ao registrar venda.");
    }
  }

  const filtered      = filter === "ALL" ? vehicles : vehicles.filter(v => v.status === filter);
  const ativos        = vehicles.filter(v => v.status === "ACTIVE").length;
  const draft         = vehicles.filter(v => v.status === "DRAFT").length;
  const pausados      = vehicles.filter(v => v.status === "PAUSED").length;
  const vendidos      = vehicles.filter(v => v.status === "SOLD").length;
  const venderVehicle = vehicles.find(v => v.id === venderId);

  return (
    <ErpLayout title="Estoque" subtitle="Todos os veículos cadastrados na sua loja">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-2xl">{toast}</div>
      )}

      {/* Modal vender */}
      {venderId && venderVehicle && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={() => setVenderId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-black/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Icon name="sell" className="text-green-600" />
                </div>
                <div>
                  <p className="font-black text-gray-900">Registrar venda</p>
                  <p className="text-xs text-gray-400 mt-0.5">{venderVehicle.brand} {venderVehicle.model}</p>
                </div>
              </div>
              <button onClick={() => setVenderId(null)} className="p-1 rounded-lg hover:bg-gray-100">
                <Icon name="close" className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs font-black uppercase tracking-wider text-gray-400">Dados do comprador</p>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">Nome completo</label>
                <input type="text" value={buyer.buyerNome} onChange={e => setB("buyerNome", e.target.value)}
                  className={iCls} placeholder="Nome do comprador" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">CPF / CNPJ</label>
                  <input type="text" value={buyer.buyerDocumento} onChange={e => setB("buyerDocumento", e.target.value)}
                    className={iCls} placeholder="000.000.000-00" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">Telefone</label>
                  <input type="tel" value={buyer.buyerTelefone}
                    onChange={e => setB("buyerTelefone", maskPhone(e.target.value))}
                    className={iCls} placeholder="(00) 00000-0000" maxLength={15} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">E-mail</label>
                <input type="email" value={buyer.buyerEmail} onChange={e => setB("buyerEmail", e.target.value)}
                  className={iCls} placeholder="email@exemplo.com" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">Data da venda</label>
                <input type="date" value={buyer.soldAt} onChange={e => setB("soldAt", e.target.value)}
                  className={iCls} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">Observações</label>
                <textarea value={buyer.observacao} onChange={e => setB("observacao", e.target.value)}
                  className={`${iCls} resize-none`} rows={2} placeholder="Informações adicionais..." />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-black/10">
              <button onClick={handleVender} disabled={selling}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-black text-sm hover:bg-green-600 transition disabled:opacity-50">
                {selling && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <Icon name="sell" className="text-sm" /> Confirmar venda
              </button>
              <button onClick={() => setVenderId(null)}
                className="px-6 py-3 rounded-xl border border-black/10 text-sm text-gray-500 hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <ErpKpiCard label="Total" value={String(vehicles.length)} icon="inventory" />
        <ErpKpiCard label="Ativos" value={String(ativos)} icon="check_circle" accent={ativos > 0} />
        <ErpKpiCard label="Rascunho" value={String(draft)} icon="edit_note" />
        <ErpKpiCard label="Pausados" value={String(pausados)} icon="pause_circle" />
        <ErpKpiCard label="Vendidos" value={String(vendidos)} icon="sell" />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { v: "ALL",    l: "Todos" },
          { v: "ACTIVE", l: `Ativos (${ativos})` },
          { v: "DRAFT",  l: `Rascunho (${draft})` },
          { v: "PAUSED", l: `Pausados (${pausados})` },
          { v: "SOLD",   l: `Vendidos (${vendidos})` },
        ].map(f => (
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
                    <Link href={v.status === "SOLD" ? `/vendas/vendidos/${v.id}` : `/vendas/estoque/${v.id}`} className="flex items-center gap-3 hover:opacity-80 transition">
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
                      {v.status !== "SOLD" && (
                        <>
                          <Link href={`/vendas/estoque/${v.id}`}
                            className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-black text-gray-600 hover:bg-gray-50 transition whitespace-nowrap">
                            Ver ficha
                          </Link>
                          <Link href={`/vendas/veiculos/editar/${v.id}`}
                            className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-black text-gray-600 hover:bg-gray-50 transition">
                            Editar
                          </Link>
                          <button onClick={() => { setBuyer({ ...EMPTY_BUYER }); setVenderId(v.id); }}
                            className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-black text-white hover:bg-green-600 transition whitespace-nowrap">
                            Vender
                          </button>
                        </>
                      )}
                      {v.status === "SOLD" && (
                        <Link href={`/vendas/vendidos/${v.id}`}
                          className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-black text-green-700 hover:bg-green-100 transition whitespace-nowrap">
                          Ver venda
                        </Link>
                      )}
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
