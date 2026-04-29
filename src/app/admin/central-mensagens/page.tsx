"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

type Msg = {
  id: string; title: string; type: string; status: string;
  segment: string; scheduledAt?: string; sentAt?: string;
  totalSent: number; updatedAt: string;
};

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  promotional: { label: "Promocional", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  notice:      { label: "Aviso",       color: "bg-blue-500/10 text-blue-400 border-blue-500/20"     },
  warning:     { label: "Advertência", color: "bg-red-500/10 text-red-400 border-red-500/20"        },
  system:      { label: "Sistema",     color: "bg-green-500/10 text-green-400 border-green-500/20"  },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft:     { label: "Rascunho",  color: "bg-white/5 text-neutral-400 border-white/10"           },
  scheduled: { label: "Agendada",  color: "bg-blue-500/10 text-blue-400 border-blue-500/20"       },
  sent:      { label: "Enviada",   color: "bg-green-500/10 text-green-400 border-green-500/20"    },
  archived:  { label: "Arquivada", color: "bg-neutral-500/10 text-neutral-500 border-neutral-500/20" },
};

const SEGMENT_CONFIG: Record<string, { label: string; color: string }> = {
  all:     { label: "Todos",    color: "bg-sky-500/10 text-sky-400 border-sky-500/20"       },
  pf:      { label: "PF",       color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  lojista: { label: "Lojistas", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
};

function Badge({ cfg }: { cfg: { label: string; color: string } }) {
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

export default function CentralMensagensPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({ status: "", type: "", segment: "", q: "" });
  const [confirming, setConfirming] = useState<{ id: string; action: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (filters.status)  p.set("status",  filters.status);
    if (filters.type)    p.set("type",    filters.type);
    if (filters.segment) p.set("segment", filters.segment);
    if (filters.q)       p.set("q",       filters.q);
    p.set("page", String(page));
    const r = await fetch(`/api/admin/cms-messages?${p}`);
    const d = await r.json();
    setMessages(d.messages ?? []);
    setTotal(d.total ?? 0);
    setLoading(false);
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);

  async function archive(id: string) {
    await fetch(`/api/admin/cms-messages/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    });
    load();
  }

  async function deleteMsg(id: string) {
    await fetch(`/api/admin/cms-messages/${id}`, { method: "DELETE" });
    setConfirming(null);
    load();
  }

  async function sendNow(id: string) {
    const r = await fetch(`/api/admin/cms-messages/${id}`, { method: "PATCH" });
    const d = await r.json();
    if (d.ok) alert(`✅ Mensagem enviada para ${d.totalSent} usuários.`);
    else alert(d.error ?? "Erro ao enviar.");
    setConfirming(null);
    load();
  }

  async function bulkArchive() {
    await Promise.all([...selected].map(id => archive(id)));
    setSelected(new Set());
  }

  async function bulkDelete() {
    await Promise.all([...selected].map(id => fetch(`/api/admin/cms-messages/${id}`, { method: "DELETE" })));
    setSelected(new Set());
    load();
  }

  function toggleSelect(id: string) {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }

  function toggleAll() {
    setSelected(prev => prev.size === messages.length ? new Set() : new Set(messages.map(m => m.id)));
  }

  const fmt = (iso?: string) => iso ? new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Central de Mensagens</h1>
          <p className="text-neutral-400 text-sm mt-1">{total} mensagens no total</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/central-mensagens/automacoes"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-neutral-300 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
            <Icon name="bolt" className="text-base" /> Automações
          </Link>
          <Link href="/admin/central-mensagens/templates"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-neutral-300 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
            <Icon name="bookmark" className="text-base" /> Templates
          </Link>
          <Link href="/admin/central-mensagens/nova"
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black px-5 py-2.5 rounded-xl text-sm transition-colors">
            <Icon name="add" className="text-base" /> Nova mensagem
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          value={filters.q}
          onChange={e => { setFilters(f => ({ ...f, q: e.target.value })); setPage(1); }}
          placeholder="Buscar por título..."
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500/50 w-64"
        />
        {(["status", "type", "segment"] as const).map(field => (
          <select key={field}
            value={filters[field]}
            onChange={e => { setFilters(f => ({ ...f, [field]: e.target.value })); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50"
          >
            <option value="">{ field === "status" ? "Todos status" : field === "type" ? "Todos tipos" : "Todos públicos" }</option>
            {field === "status" && ["draft","scheduled","sent","archived"].map(v => <option key={v} value={v}>{STATUS_CONFIG[v]?.label}</option>)}
            {field === "type"   && ["promotional","notice","warning","system"].map(v => <option key={v} value={v}>{TYPE_CONFIG[v]?.label}</option>)}
            {field === "segment" && ["all","pf","lojista"].map(v => <option key={v} value={v}>{SEGMENT_CONFIG[v]?.label}</option>)}
          </select>
        ))}
        {(filters.status || filters.type || filters.segment || filters.q) && (
          <button onClick={() => { setFilters({ status: "", type: "", segment: "", q: "" }); setPage(1); }}
            className="text-xs text-neutral-500 hover:text-white transition-colors px-3">
            Limpar filtros
          </button>
        )}
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2.5">
          <span className="text-yellow-400 text-sm font-semibold">{selected.size} selecionadas</span>
          <button onClick={bulkArchive} className="text-xs text-neutral-300 hover:text-white flex items-center gap-1">
            <Icon name="archive" className="text-sm" /> Arquivar
          </button>
          <button onClick={bulkDelete} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
            <Icon name="delete" className="text-sm" /> Excluir
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-neutral-500 hover:text-white">Cancelar</button>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-[#111414] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-4 py-3 text-left w-10">
                <input type="checkbox" checked={selected.size === messages.length && messages.length > 0}
                  onChange={toggleAll} className="accent-yellow-500" />
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-neutral-500">Título</th>
              <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-neutral-500">Tipo</th>
              <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-neutral-500">Status</th>
              <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-neutral-500">Público</th>
              <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-neutral-500">Enviados</th>
              <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-neutral-500">Data</th>
              <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-neutral-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={8} className="text-center py-16 text-neutral-500">Carregando...</td></tr>
            ) : messages.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-16 text-neutral-500">Nenhuma mensagem encontrada.</td></tr>
            ) : messages.map(m => (
              <tr key={m.id} className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.has(m.id)} onChange={() => toggleSelect(m.id)} className="accent-yellow-500" />
                </td>
                <td className="px-4 py-3">
                  <p className="text-white font-semibold truncate max-w-xs">{m.title}</p>
                  <p className="text-neutral-500 text-xs mt-0.5">Editado {fmt(m.updatedAt)}</p>
                </td>
                <td className="px-4 py-3 text-center"><Badge cfg={TYPE_CONFIG[m.type] ?? { label: m.type, color: "bg-white/5 text-white border-white/10" }} /></td>
                <td className="px-4 py-3 text-center"><Badge cfg={STATUS_CONFIG[m.status] ?? { label: m.status, color: "bg-white/5 text-white border-white/10" }} /></td>
                <td className="px-4 py-3 text-center"><Badge cfg={SEGMENT_CONFIG[m.segment] ?? { label: m.segment, color: "bg-white/5 text-white border-white/10" }} /></td>
                <td className="px-4 py-3 text-center text-neutral-300 font-semibold">{m.totalSent > 0 ? m.totalSent.toLocaleString("pt-BR") : "—"}</td>
                <td className="px-4 py-3 text-center text-neutral-400 text-xs">
                  {m.status === "sent" ? fmt(m.sentAt) : m.status === "scheduled" ? fmt(m.scheduledAt) : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <Link href={`/admin/central-mensagens/${m.id}`}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-colors" title="Editar">
                      <Icon name="edit" className="text-sm" />
                    </Link>
                    {m.status !== "sent" && m.status !== "archived" && (
                      <button onClick={() => setConfirming({ id: m.id, action: "send" })}
                        className="p-1.5 rounded-lg hover:bg-green-500/10 text-neutral-400 hover:text-green-400 transition-colors" title="Enviar agora">
                        <Icon name="send" className="text-sm" />
                      </button>
                    )}
                    {m.status !== "archived" && (
                      <button onClick={() => archive(m.id)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-colors" title="Arquivar">
                        <Icon name="archive" className="text-sm" />
                      </button>
                    )}
                    {m.status !== "sent" && (
                      <button onClick={() => setConfirming({ id: m.id, action: "delete" })}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition-colors" title="Excluir">
                        <Icon name="delete" className="text-sm" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {total > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(total / 20) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${p === page ? "bg-yellow-500 text-black" : "bg-white/5 text-neutral-400 hover:bg-white/10"}`}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Modal de confirmação */}
      {confirming && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#111414] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-white font-black text-lg mb-2">
              {confirming.action === "send" ? "Enviar mensagem?" : "Excluir mensagem?"}
            </h3>
            <p className="text-neutral-400 text-sm mb-6">
              {confirming.action === "send"
                ? "A mensagem será enviada imediatamente para todos os destinatários do segmento selecionado."
                : "Esta ação não pode ser desfeita."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirming(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-neutral-300 font-semibold py-2.5 rounded-xl text-sm transition-colors">
                Cancelar
              </button>
              <button
                onClick={() => confirming.action === "send" ? sendNow(confirming.id) : deleteMsg(confirming.id)}
                className={`flex-1 font-black py-2.5 rounded-xl text-sm transition-colors ${confirming.action === "send" ? "bg-green-600 hover:bg-green-500 text-white" : "bg-red-600 hover:bg-red-500 text-white"}`}>
                {confirming.action === "send" ? "Enviar agora" : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
