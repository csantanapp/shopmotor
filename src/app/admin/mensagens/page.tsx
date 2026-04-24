"use client";

import { useEffect, useState, useCallback } from "react";
import Icon from "@/components/ui/Icon";

interface Msg {
  id: string; origem: string; status: string;
  name: string; email: string; phone: string | null;
  subject: string | null; message: string;
  company: string | null; segment: string | null; budget: string | null;
  replyText: string | null; repliedAt: string | null;
  readAt: string | null; createdAt: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  novo:       { label: "Novo",       color: "bg-blue-500/20 text-blue-400" },
  lido:       { label: "Lido",       color: "bg-white/10 text-neutral-400" },
  respondido: { label: "Respondido", color: "bg-green-500/20 text-green-400" },
  arquivado:  { label: "Arquivado",  color: "bg-white/5 text-neutral-600" },
};

export default function AdminMensagens() {
  const [msgs, setMsgs]       = useState<Msg[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [origem, setOrigem]   = useState("");
  const [status, setStatus]   = useState("");
  const [selected, setSelected] = useState<Msg | null>(null);
  const [reply, setReply]     = useState("");
  const [sending, setSending] = useState(false);
  const [counts, setCounts]   = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page), q: search });
    if (origem) p.set("origem", origem);
    if (status) p.set("status", status);
    const r = await fetch(`/api/admin/mensagens?${p}`);
    const d = await r.json();
    setMsgs(d.messages ?? []);
    setTotal(d.total ?? 0);
    setPages(d.pages ?? 1);
    const c: Record<string, number> = {};
    for (const row of d.counts ?? []) c[row.status] = row._count;
    setCounts(c);
    setLoading(false);
  }, [page, search, origem, status]);

  useEffect(() => { setPage(1); }, [search, origem, status]);
  useEffect(() => { load(); }, [load]);

  async function openMsg(msg: Msg) {
    setSelected(msg);
    setReply(msg.replyText ?? "");
    if (msg.status === "novo") {
      await fetch("/api/admin/mensagens", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msg.id, status: "lido" }),
      });
      load();
    }
  }

  async function handleStatus(id: string, st: string) {
    await fetch("/api/admin/mensagens", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: st }),
    });
    setSelected(s => s?.id === id ? { ...s, status: st } : s);
    load();
  }

  async function handleReply() {
    if (!selected || !reply.trim()) return;
    setSending(true);
    await fetch("/api/admin/mensagens", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, replyText: reply }),
    });
    setSending(false);
    setSelected(s => s ? { ...s, status: "respondido", replyText: reply } : s);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta mensagem?")) return;
    await fetch("/api/admin/mensagens", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (selected?.id === id) setSelected(null);
    load();
  }

  const totalNovos = counts["novo"] ?? 0;

  return (
    <div className="p-6 lg:p-8 space-y-6 h-screen flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            Mensagens
            {totalNovos > 0 && (
              <span className="bg-blue-500 text-white text-xs font-black px-2 py-0.5 rounded-full">{totalNovos} novos</span>
            )}
          </h1>
          <p className="text-neutral-500 text-sm mt-1">{total} mensagens no total</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 flex-shrink-0">
        <div className="flex items-center gap-2 bg-[#111414] border border-white/5 rounded-xl px-4 py-2.5 flex-1 min-w-[180px]">
          <Icon name="search" className="text-neutral-500 text-lg flex-shrink-0" />
          <input
            className="bg-transparent outline-none text-sm text-white placeholder:text-neutral-600 w-full"
            placeholder="Nome, e-mail, empresa..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select value={origem} onChange={e => setOrigem(e.target.value)}
          className="bg-[#111414] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white outline-none">
          <option value="">Todas as origens</option>
          <option value="contato">Contato (/contato)</option>
          <option value="anuncie">Proposta (/anuncie)</option>
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="bg-[#111414] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white outline-none">
          <option value="">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([v, { label }]) => (
            <option key={v} value={v}>{label} {counts[v] ? `(${counts[v]})` : ""}</option>
          ))}
        </select>
      </div>

      {/* Layout split */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* Lista */}
        <div className="w-full lg:w-96 flex-shrink-0 bg-[#111414] border border-white/5 rounded-2xl flex flex-col overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center flex-1">
              <span className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
            </div>
          ) : msgs.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-neutral-600 gap-2">
              <Icon name="mail" className="text-4xl" />
              <p className="text-sm">Nenhuma mensagem</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {msgs.map(msg => (
                <button
                  key={msg.id}
                  onClick={() => openMsg(msg)}
                  className={`w-full text-left px-5 py-4 hover:bg-white/[0.03] transition-colors ${selected?.id === msg.id ? "bg-white/[0.05]" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      {msg.status === "novo" && (
                        <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                      )}
                      <p className={`text-sm font-semibold truncate ${msg.status === "novo" ? "text-white" : "text-neutral-300"}`}>
                        {msg.company ? `${msg.company} — ${msg.name}` : msg.name}
                      </p>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${STATUS_LABELS[msg.status]?.color}`}>
                      {STATUS_LABELS[msg.status]?.label}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 truncate mb-1">{msg.subject || msg.message}</p>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-600">
                    <span className={`uppercase font-bold ${msg.origem === "anuncie" ? "text-yellow-600" : "text-neutral-600"}`}>
                      {msg.origem === "anuncie" ? "proposta" : "contato"}
                    </span>
                    <span>·</span>
                    <span>{new Date(msg.createdAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Paginação */}
          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 flex-shrink-0">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="text-neutral-400 hover:text-white disabled:opacity-30 transition-colors">
                <Icon name="chevron_left" className="text-lg" />
              </button>
              <span className="text-xs text-neutral-500">{page}/{pages}</span>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                className="text-neutral-400 hover:text-white disabled:opacity-30 transition-colors">
                <Icon name="chevron_right" className="text-lg" />
              </button>
            </div>
          )}
        </div>

        {/* Detalhe */}
        {selected ? (
          <div className="flex-1 bg-[#111414] border border-white/5 rounded-2xl flex flex-col overflow-hidden min-w-0">
            {/* Header msg */}
            <div className="px-6 py-4 border-b border-white/5 flex items-start justify-between gap-4 flex-shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-black text-white">
                    {selected.company ? `${selected.company} — ${selected.name}` : selected.name}
                  </h2>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${STATUS_LABELS[selected.status]?.color}`}>
                    {STATUS_LABELS[selected.status]?.label}
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${selected.origem === "anuncie" ? "bg-yellow-500/10 text-yellow-400" : "bg-white/5 text-neutral-500"}`}>
                    {selected.origem === "anuncie" ? "Proposta comercial" : "Contato"}
                  </span>
                </div>
                <p className="text-sm text-neutral-400 mt-0.5">{selected.email}{selected.phone ? ` · ${selected.phone}` : ""}</p>
                <p className="text-xs text-neutral-600 mt-0.5">{new Date(selected.createdAt).toLocaleString("pt-BR")}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {selected.status !== "arquivado" && (
                  <button onClick={() => handleStatus(selected.id, "arquivado")}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    title="Arquivar">
                    <Icon name="archive" className="text-sm text-neutral-400" />
                  </button>
                )}
                {selected.status === "arquivado" && (
                  <button onClick={() => handleStatus(selected.id, "lido")}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    title="Desarquivar">
                    <Icon name="unarchive" className="text-sm text-neutral-400" />
                  </button>
                )}
                <button onClick={() => handleDelete(selected.id)}
                  className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                  title="Excluir">
                  <Icon name="delete" className="text-sm text-red-400" />
                </button>
              </div>
            </div>

            {/* Corpo */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Dados extras (proposta) */}
              {selected.origem === "anuncie" && (selected.segment || selected.budget) && (
                <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                  {selected.segment && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-0.5">Segmento</p>
                      <p className="text-neutral-300">{selected.segment}</p>
                    </div>
                  )}
                  {selected.budget && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-0.5">Investimento</p>
                      <p className="text-neutral-300">{selected.budget}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Assunto + mensagem */}
              {selected.subject && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Assunto</p>
                  <p className="text-sm text-neutral-300 font-semibold">{selected.subject}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Mensagem</p>
                <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap bg-white/[0.02] rounded-xl p-4">
                  {selected.message || "—"}
                </p>
              </div>

              {/* Resposta anterior */}
              {selected.replyText && (
                <div className="border-l-2 border-green-500/30 pl-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-green-500/60 mb-2">
                    Respondido em {selected.repliedAt ? new Date(selected.repliedAt).toLocaleString("pt-BR") : ""}
                  </p>
                  <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-wrap">{selected.replyText}</p>
                </div>
              )}
            </div>

            {/* Área de resposta */}
            <div className="px-6 py-4 border-t border-white/5 space-y-3 flex-shrink-0">
              <p className="text-xs font-black uppercase tracking-widest text-neutral-500">Responder via e-mail</p>
              <textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                rows={4}
                placeholder={`Escreva sua resposta para ${selected.name}...`}
                className="w-full bg-[#1a1e1e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 resize-none focus:border-primary-container/50 transition-colors"
              />
              <div className="flex gap-3">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject ?? "Sua mensagem na ShopMotor")}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-sm text-neutral-400 transition-colors"
                >
                  <Icon name="mail" className="text-base" />
                  Abrir e-mail
                </a>
                <button
                  onClick={handleReply}
                  disabled={sending || !reply.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full bg-primary-container text-on-primary-container text-sm font-black uppercase tracking-widest hover:-translate-y-0.5 transition-all disabled:opacity-60"
                >
                  {sending ? (
                    <span className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />
                  ) : (
                    <Icon name="send" className="text-base" />
                  )}
                  {sending ? "Enviando..." : "Enviar resposta"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-[#111414] border border-white/5 rounded-2xl hidden lg:flex items-center justify-center">
            <div className="text-center text-neutral-600">
              <Icon name="mail_outline" className="text-6xl mb-3 block" />
              <p className="text-sm">Selecione uma mensagem para visualizar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
