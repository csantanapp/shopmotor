"use client";

import { useEffect, useState, useCallback } from "react";
import Icon from "@/components/ui/Icon";

const STATUS_LABELS: Record<string, string> = {
  novo: "Novo", contatado: "Contatado", convertido: "Convertido", descartado: "Descartado",
};
const STATUS_COLORS: Record<string, string> = {
  novo: "bg-blue-500/10 text-blue-400",
  contatado: "bg-yellow-500/10 text-yellow-400",
  convertido: "bg-green-500/10 text-green-400",
  descartado: "bg-neutral-500/10 text-neutral-500",
};

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}

type Lead = {
  id: string; nome: string; cpf: string; nascimento: string; email: string;
  cidade: string; whatsapp: string; prazo: string; valorCarro: number;
  entrada: number; financiado: number; parcelas: number; pmt: number;
  status: string; createdAt: string; storeSlug: string | null;
};

export default function AdminLeads() {
  const [items, setItems] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/leads?${params}`);
    const data = await res.json();
    setItems(data.items);
    setTotal(data.total);
    setPages(data.pages);
    setStatusCounts(data.statusCounts ?? {});
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    await fetch("/api/admin/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (selected?.id === id) setSelected(s => s ? { ...s, status } : s);
    load();
  }

  async function deleteLead(id: string) {
    if (!confirm("Excluir este lead?")) return;
    await fetch(`/api/admin/leads?id=${id}`, { method: "DELETE" });
    if (selected?.id === id) setSelected(null);
    load();
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Leads — Financiamento</h1>
          <p className="text-neutral-500 text-sm mt-1">{total} simulações recebidas</p>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setStatusFilter(statusFilter === key ? "" : key); setPage(1); }}
            className={`bg-[#111414] border rounded-xl p-4 text-left transition-all ${statusFilter === key ? "border-primary-container" : "border-white/5 hover:border-white/10"}`}
          >
            <p className="text-2xl font-black text-white">{statusCounts[key] ?? 0}</p>
            <p className={`text-xs font-bold mt-1 ${STATUS_COLORS[key].split(" ")[1]}`}>{label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-base" />
          <input
            className="w-full bg-[#111414] border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:border-primary-container"
            placeholder="Buscar por nome, e-mail, cidade..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        {statusFilter && (
          <button onClick={() => setStatusFilter("")} className="text-xs text-neutral-400 hover:text-white border border-white/10 rounded-xl px-4">
            Limpar filtro
          </button>
        )}
      </div>

      <div className="flex gap-6">
        {/* Table */}
        <div className="flex-1 min-w-0">
          <div className="bg-[#111414] border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-neutral-500 text-xs uppercase tracking-widest">
                  <th className="text-left px-5 py-3 font-bold">Lead</th>
                  <th className="text-left px-5 py-3 font-bold hidden xl:table-cell">Loja</th>
                  <th className="text-left px-5 py-3 font-bold hidden lg:table-cell">Simulação</th>
                  <th className="text-left px-5 py-3 font-bold hidden md:table-cell">Prazo</th>
                  <th className="text-left px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading && (
                  <tr><td colSpan={6} className="text-center py-10 text-neutral-600 text-sm">Carregando...</td></tr>
                )}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-neutral-600 text-sm">Nenhum lead encontrado.</td></tr>
                )}
                {items.map(lead => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelected(lead)}
                    className={`hover:bg-white/3 cursor-pointer transition-colors ${selected?.id === lead.id ? "bg-white/5" : ""}`}
                  >
                    <td className="px-5 py-3">
                      <p className="font-semibold text-white">{lead.nome}</p>
                      <p className="text-xs text-neutral-500">{lead.whatsapp}</p>
                      <p className="text-xs text-neutral-600">{lead.cidade}</p>
                    </td>
                    <td className="px-5 py-3 hidden xl:table-cell">
                      {lead.storeSlug ? (
                        <a href={`/loja/${lead.storeSlug}`} target="_blank" rel="noreferrer"
                          className="text-xs text-yellow-400 hover:underline font-mono">
                          /loja/{lead.storeSlug}
                        </a>
                      ) : (
                        <span className="text-xs text-neutral-600">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell">
                      <p className="text-white font-bold">{fmt(lead.valorCarro)}</p>
                      <p className="text-xs text-neutral-500">{lead.parcelas}x de {fmt(lead.pmt)}</p>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className="text-xs text-neutral-400">{lead.prazo}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLORS[lead.status]}`}>
                        {STATUS_LABELS[lead.status] ?? lead.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <p className="text-xs text-neutral-600">{new Date(lead.createdAt).toLocaleDateString("pt-BR")}</p>
                      <p className="text-xs text-neutral-700">{new Date(lead.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-neutral-500">
              <span>Página {page} de {pages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-white/10 disabled:opacity-30 hover:border-white/20">Anterior</button>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                  className="px-3 py-1.5 rounded-lg border border-white/10 disabled:opacity-30 hover:border-white/20">Próxima</button>
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-80 flex-shrink-0">
            <div className="bg-[#111414] border border-white/5 rounded-2xl p-5 sticky top-8">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black text-white text-sm">Detalhes do Lead</h3>
                <button onClick={() => setSelected(null)} className="text-neutral-500 hover:text-white">
                  <Icon name="close" className="text-base" />
                </button>
              </div>

              <div className="space-y-3 text-sm mb-5">
                {[
                  { label: "Nome", value: selected.nome },
                  { label: "CPF", value: selected.cpf },
                  { label: "Nascimento", value: selected.nascimento },
                  { label: "E-mail", value: selected.email },
                  { label: "WhatsApp", value: selected.whatsapp },
                  { label: "Cidade", value: selected.cidade },
                  { label: "Prazo de compra", value: selected.prazo },
                  { label: "Loja origem", value: selected.storeSlug ? `/loja/${selected.storeSlug}` : "ShopMotor (direto)" },
                ].map(row => (
                  <div key={row.label}>
                    <p className="text-xs text-neutral-600 uppercase tracking-wider">{row.label}</p>
                    <p className="text-white font-semibold">{row.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white/5 rounded-xl p-4 space-y-2 text-sm mb-5">
                <p className="text-xs font-black text-neutral-500 uppercase tracking-wider mb-3">Simulação</p>
                {[
                  { label: "Valor do veículo", value: fmt(selected.valorCarro) },
                  { label: "Entrada", value: fmt(selected.entrada) },
                  { label: "Financiado", value: fmt(selected.financiado) },
                  { label: "Parcelas", value: `${selected.parcelas}x de ${fmt(selected.pmt)}` },
                ].map(row => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-neutral-500">{row.label}</span>
                    <span className="text-white font-bold">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Status */}
              <div className="mb-4">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Alterar status</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => updateStatus(selected.id, key)}
                      className={`text-xs font-bold py-2 rounded-lg border transition-all ${
                        selected.status === key ? "border-primary-container bg-primary-container/10 text-primary-container" : "border-white/10 text-neutral-400 hover:border-white/20"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={`https://wa.me/55${selected.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  className="flex-1 bg-green-600 text-white text-xs font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-green-700 transition-colors"
                >
                  <Icon name="chat" className="text-sm" /> WhatsApp
                </a>
                <button
                  onClick={() => deleteLead(selected.id)}
                  className="px-3 py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Icon name="delete" className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
