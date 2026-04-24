"use client";

import { useEffect, useState, useCallback } from "react";
import Icon from "@/components/ui/Icon";

const STATUS_LABELS: Record<string, string> = {
  novo: "Novo", contatado: "Contatado", convertido: "Convertido", descartado: "Descartado",
};
const STATUS_COLORS: Record<string, { badge: string; dot: string }> = {
  novo:       { badge: "bg-blue-50 text-blue-700",   dot: "bg-blue-500" },
  contatado:  { badge: "bg-yellow-50 text-yellow-700", dot: "bg-yellow-500" },
  convertido: { badge: "bg-green-50 text-green-700",  dot: "bg-green-500" },
  descartado: { badge: "bg-zinc-100 text-zinc-400",   dot: "bg-zinc-300" },
};

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}

type Lead = {
  id: string; nome: string; cpf: string; nascimento: string; email: string;
  cidade: string; whatsapp: string; prazo: string; valorCarro: number;
  entrada: number; financiado: number; parcelas: number; pmt: number;
  status: string; createdAt: string; vehicleId: string | null;
};

export default function LeadsFinanciamentoPage() {
  const [items, setItems] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/perfil/leads-financiamento?${params}`);
    if (res.status === 403) { setForbidden(true); setLoading(false); return; }
    const data = await res.json();
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
    setPages(data.pages ?? 1);
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    setUpdating(true);
    await fetch("/api/perfil/leads-financiamento", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setUpdating(false);
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
    setItems(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  }

  const waLink = (phone: string, name: string) => {
    const num = phone.replace(/\D/g, "");
    const msg = encodeURIComponent(`Olá ${name}! Vi sua simulação de financiamento na ShopMotor e gostaria de te apresentar as melhores condições para o seu veículo. Posso te ajudar?`);
    return `https://wa.me/55${num}?text=${msg}`;
  };

  if (forbidden) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
        <Icon name="lock" className="text-orange-400 text-3xl" />
      </div>
      <h2 className="text-xl font-black text-zinc-900">Recurso exclusivo — Plano Elite</h2>
      <p className="text-zinc-500 text-sm max-w-sm">Os Leads de Financiamento são enviados para lojas com o plano Elite ativo.</p>
      <a href="/perfil/plano" className="bg-zinc-900 text-white font-black px-8 py-3 rounded-full text-sm hover:bg-zinc-700 transition-colors">
        Fazer upgrade para Elite
      </a>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-zinc-900 uppercase">Leads Financiamento</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Clientes que simularam financiamento pela sua vitrine</p>
        </div>
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-2">
          <Icon name="diamond" className="text-orange-500 text-base" />
          <span className="text-xs font-black text-orange-700">Plano Elite</span>
        </div>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total",      value: total,         color: "text-zinc-900" },
          { label: "Novos",      value: items.filter(i => i.status === "novo").length,       color: "text-blue-600" },
          { label: "Convertidos", value: items.filter(i => i.status === "convertido").length, color: "text-green-600" },
          { label: "Descartados", value: items.filter(i => i.status === "descartado").length, color: "text-zinc-400" },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm text-center">
            <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filtro de status */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {["", "novo", "contatado", "convertido", "descartado"].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`text-xs font-black px-4 py-2 rounded-full transition-all ${
              statusFilter === s ? "bg-zinc-900 text-white" : "bg-white border border-zinc-200 text-zinc-500 hover:border-zinc-400"
            }`}>
            {s ? STATUS_LABELS[s] : "Todos"}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden mb-5">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-500 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <Icon name="inbox" className="text-4xl text-zinc-300 mb-3" />
            <p className="font-bold text-zinc-400 text-sm">Nenhum lead encontrado</p>
            <p className="text-xs text-zinc-400 mt-1">Quando um cliente simular via sua vitrine, aparecerá aqui.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-5 py-3 text-xs font-black uppercase tracking-widest text-zinc-400">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-400 hidden md:table-cell">Cidade</th>
                <th className="text-right px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-400">Financiado</th>
                <th className="text-center px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-400 hidden lg:table-cell">Parcelas</th>
                <th className="text-center px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-400">Status</th>
                <th className="text-center px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-400">WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {items.map(lead => {
                const s = STATUS_COLORS[lead.status] ?? STATUS_COLORS.novo;
                return (
                  <tr key={lead.id} onClick={() => setSelected(lead)}
                    className="hover:bg-zinc-50 cursor-pointer transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                        <div>
                          <p className="font-bold text-zinc-900">{lead.nome}</p>
                          <p className="text-xs text-zinc-400">{lead.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-500 hidden md:table-cell">{lead.cidade}</td>
                    <td className="px-4 py-3.5 text-right font-black text-zinc-900">{fmt(lead.financiado)}</td>
                    <td className="px-4 py-3.5 text-center text-zinc-500 hidden lg:table-cell">{lead.parcelas}x de {fmt(lead.pmt)}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${s.badge}`}>
                        {STATUS_LABELS[lead.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                      <a href={waLink(lead.whatsapp, lead.nome)} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 bg-green-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full hover:bg-green-400 transition-colors">
                        <Icon name="chat" className="text-xs" /> WA
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginação */}
      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-full text-sm font-black transition-all ${
                p === page ? "bg-zinc-900 text-white" : "bg-white border border-zinc-200 text-zinc-500 hover:border-zinc-400"
              }`}>{p}</button>
          ))}
        </div>
      )}

      {/* Painel detalhe */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>

            {/* Header do painel */}
            <div className="bg-zinc-900 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-1">Lead Financiamento</p>
                  <h2 className="text-xl font-black text-white">{selected.nome}</h2>
                  <p className="text-zinc-400 text-sm">{selected.cidade}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-white transition-colors">
                  <Icon name="close" className="text-xl" />
                </button>
              </div>

              {/* WhatsApp CTA — destaque */}
              <a href={waLink(selected.whatsapp, selected.nome)} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 transition-colors text-white font-black py-3 rounded-2xl text-sm w-full">
                <Icon name="chat" className="text-base" />
                Enviar mensagem no WhatsApp — {selected.whatsapp}
              </a>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">

              {/* Dados do cliente */}
              <div>
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Dados do cliente</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Nome",       value: selected.nome },
                    { label: "CPF",        value: selected.cpf },
                    { label: "Nascimento", value: selected.nascimento },
                    { label: "E-mail",     value: selected.email },
                    { label: "Cidade",     value: selected.cidade },
                    { label: "WhatsApp",   value: selected.whatsapp },
                    { label: "Prazo compra", value: selected.prazo },
                    { label: "Recebido em", value: new Date(selected.createdAt).toLocaleDateString("pt-BR") },
                  ].map(f => (
                    <div key={f.label}>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">{f.label}</p>
                      <p className="text-sm font-bold text-zinc-900 mt-0.5 break-all">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulação */}
              <div className="bg-zinc-50 rounded-2xl p-4">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Simulação</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Valor do veículo", value: fmt(selected.valorCarro) },
                    { label: "Entrada",          value: fmt(selected.entrada) },
                    { label: "Valor financiado", value: fmt(selected.financiado) },
                    { label: "Parcelas",         value: `${selected.parcelas}x de ${fmt(selected.pmt)}` },
                  ].map(f => (
                    <div key={f.label}>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">{f.label}</p>
                      <p className="text-sm font-black text-zinc-900 mt-0.5">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Status do lead</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <button key={key} onClick={() => updateStatus(selected.id, key)} disabled={updating}
                      className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                        selected.status === key
                          ? "bg-zinc-900 text-white"
                          : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
