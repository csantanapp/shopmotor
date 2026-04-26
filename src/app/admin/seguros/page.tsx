"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";

interface Lead {
  id: string; nome: string; email: string; telefone: string;
  tipoVeiculo: string; marca: string; modelo: string; ano: string;
  cep: string; tipoPessoa: string; cpfCnpj: string;
  possuiSeguro: boolean; status: string; leadTipo: string;
  storeSlug?: string; createdAt: string;
}

const STATUS_OPTS = ["novo", "contatado", "convertido", "descartado"];
const STATUS_COLORS: Record<string, string> = {
  novo:       "bg-primary-container/20 text-primary",
  contatado:  "bg-blue-100 text-blue-700",
  convertido: "bg-green-100 text-green-700",
  descartado: "bg-surface-container text-on-surface-variant",
};
const TIPO_COLORS: Record<string, string> = {
  comum:    "bg-surface-container text-on-surface-variant",
  lojista:  "bg-primary-container/20 text-primary",
  premium:  "bg-yellow-100 text-yellow-700",
};

export default function AdminSeguros() {
  const [leads, setLeads]       = useState<Lead[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage]         = useState(1);
  const [pages, setPages]       = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (statusFilter) params.set("status", statusFilter);
    const r = await fetch(`/api/admin/seguros?${params}`);
    const d = await r.json();
    setLeads(d.items ?? []);
    setTotal(d.total ?? 0);
    setPages(d.pages ?? 1);
    setLoading(false);
  }

  useEffect(() => { load(); }, [page, statusFilter]);

  async function updateStatus(id: string, status: string) {
    await fetch("/api/admin/seguros", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  }

  const filtered = leads.filter(l =>
    !filter || l.nome.toLowerCase().includes(filter.toLowerCase()) ||
    l.email.toLowerCase().includes(filter.toLowerCase()) ||
    l.marca.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white">Leads de Seguro</h1>
          <p className="text-neutral-500 text-sm mt-1">{total} leads captados</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary-container">
            <option value="">Todos os status</option>
            {STATUS_OPTS.map(s => <option key={s} value={s} className="text-black capitalize">{s}</option>)}
          </select>
          <input
            value={filter} onChange={e => setFilter(e.target.value)}
            placeholder="Buscar por nome, e-mail ou marca..."
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary-container w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-neutral-500 text-sm">
          <div className="w-5 h-5 border-2 border-neutral-600 border-t-transparent rounded-full animate-spin" />
          Carregando leads...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-neutral-600">
          <Icon name="shield" className="text-5xl mb-3" />
          <p className="font-bold">Nenhum lead encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(lead => (
            <div key={lead.id} className="bg-[#111414] border border-white/5 rounded-2xl overflow-hidden">
              {/* Row principal */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 bg-primary-container/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name={lead.tipoVeiculo === "moto" ? "two_wheeler" : "directions_car"} className="text-primary-container text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-white text-sm">{lead.nome}</p>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${TIPO_COLORS[lead.leadTipo] ?? ""}`}>
                      {lead.leadTipo}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">{lead.email} · {lead.telefone}</p>
                  <p className="text-xs text-neutral-600 mt-0.5">{lead.marca} {lead.modelo} {lead.ano} · CEP {lead.cep}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <select
                    value={lead.status}
                    onChange={e => updateStatus(lead.id, e.target.value)}
                    className={`text-xs font-black px-3 py-1.5 rounded-full border-0 outline-none cursor-pointer capitalize ${STATUS_COLORS[lead.status] ?? ""}`}
                  >
                    {STATUS_OPTS.map(s => <option key={s} value={s} className="text-black capitalize">{s}</option>)}
                  </select>
                  <p className="text-[11px] text-neutral-600 whitespace-nowrap">
                    {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                  <button onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors">
                    <Icon name={expanded === lead.id ? "expand_less" : "expand_more"} className="text-neutral-400 text-base" />
                  </button>
                </div>
              </div>

              {/* Expandido */}
              {expanded === lead.id && (
                <div className="border-t border-white/5 px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Tipo pessoa",     value: lead.tipoPessoa === "pj" ? "Jurídica" : "Física" },
                    { label: "CPF / CNPJ",      value: lead.cpfCnpj },
                    { label: "Possui seguro",   value: lead.possuiSeguro ? "Sim" : "Não" },
                    { label: "Loja",            value: lead.storeSlug ?? "—" },
                  ].map(row => (
                    <div key={row.label}>
                      <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">{row.label}</p>
                      <p className="text-sm text-neutral-300 mt-0.5">{row.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-xl border border-white/10 text-neutral-400 hover:text-white disabled:opacity-30 text-sm">
            Anterior
          </button>
          <span className="text-sm text-neutral-500">Página {page} de {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            className="px-4 py-2 rounded-xl border border-white/10 text-neutral-400 hover:text-white disabled:opacity-30 text-sm">
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
