"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ErpLayout from "@/components/erp/ErpLayout";
import Icon from "@/components/ui/Icon";
import Image from "next/image";

interface ApiMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
  sender: { id: string; name: string; avatarUrl?: string | null };
}

interface ApiConversation {
  id: string;
  buyerId: string;
  sellerId: string;
  updatedAt: string;
  vehicle: { id: string; brand: string; model: string; photos: { url: string }[] };
  buyer: { id: string; name: string; avatarUrl?: string | null; phone?: string | null; email?: string | null };
  seller: { id: string; name: string; avatarUrl?: string | null };
  messages: ApiMessage[];
}

type ColKey = "novo" | "atendimento" | "proposta" | "negociacao" | "fechado";

const COLUMNS: { key: ColKey; title: string; dot: string }[] = [
  { key: "novo",        title: "Novo lead",        dot: "bg-blue-400"   },
  { key: "atendimento", title: "Em atendimento",   dot: "bg-orange-400" },
  { key: "proposta",    title: "Proposta enviada", dot: "bg-purple-400" },
  { key: "negociacao",  title: "Negociação",       dot: "bg-yellow-400" },
  { key: "fechado",     title: "Fechado",          dot: "bg-green-400"  },
];

const NEXT_COL: Record<ColKey, ColKey | null> = {
  novo: "atendimento", atendimento: "proposta", proposta: "negociacao", negociacao: "fechado", fechado: null,
};

function timeAgo(dateStr: string) {
  const m = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function Avatar({ name, url, size = "md" }: { name: string; url?: string | null; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs";
  if (url) return <Image src={url} alt={name} width={36} height={36} className={`${sz} rounded-full object-cover shrink-0`} />;
  return (
    <div className={`${sz} rounded-full bg-primary-container flex items-center justify-center font-black text-black shrink-0`}>
      {initials(name)}
    </div>
  );
}

export default function LeadsPage() {
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [colMap, setColMap] = useState<Record<string, ColKey>>({});
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<ApiConversation | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const STORAGE_KEY = "crm_col_map";

  // Carrega conversas
  const load = useCallback(async () => {
    const res = await fetch("/api/conversations");
    const data = await res.json();
    const convs: ApiConversation[] = data.conversations ?? [];
    setConversations(convs);

    // Detecta userId do vendedor logado
    const me = convs.find(c => c.sellerId)?.sellerId ?? "";
    setUserId(me);

    // Carrega mapa de colunas salvo
    const saved: Record<string, ColKey> = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");

    // Para conversas novas (sem mapa salvo), posiciona automaticamente:
    // última mensagem do comprador → "novo"; última do vendedor → "atendimento"
    const initial: Record<string, ColKey> = { ...saved };
    convs.forEach(c => {
      if (!initial[c.id]) {
        const last = c.messages[0];
        initial[c.id] = !last || last.senderId === c.buyerId ? "novo" : "atendimento";
      }
    });
    setColMap(initial);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  // Mensagens ao abrir chat
  useEffect(() => {
    if (!active) return;
    setMsgLoading(true);
    fetch(`/api/conversations/${active.id}/messages`)
      .then(r => r.json())
      .then(d => setMessages(d.messages ?? []))
      .finally(() => setMsgLoading(false));
  }, [active]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function moveCol(convId: string, col: ColKey) {
    const updated = { ...colMap, [convId]: col };
    setColMap(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  async function sendMessage() {
    if (!text.trim() || !active || sending) return;
    setSending(true);
    const res = await fetch(`/api/conversations/${active.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.trim() }),
    });
    const data = await res.json();
    if (data.message) {
      setMessages(prev => [...prev, data.message]);
      setText("");
      setConversations(prev => prev.map(c =>
        c.id === active.id ? { ...c, messages: [data.message], updatedAt: data.message.createdAt } : c
      ));
      // Move automaticamente para "atendimento" ao responder
      if (colMap[active.id] === "novo") moveCol(active.id, "atendimento");
    }
    setSending(false);
  }

  // Só mostra conversas onde o usuário é vendedor
  const leads = conversations.filter(c => c.sellerId === userId);
  const totalUnread = leads.filter(c => c.messages[0] && c.messages[0].senderId !== userId).length;

  return (
    <ErpLayout
      title="CRM de Alta Pressão"
      subtitle="Mova leads entre as etapas — responda primeiro os mais quentes"
    >
      {/* Chat panel slide-over */}
      {active && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setActive(null)} />
          <div className="w-full max-w-md bg-white flex flex-col shadow-2xl border-l border-black/10">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-black/10">
              <button onClick={() => setActive(null)} className="rounded-lg border border-black/10 p-1.5 hover:bg-gray-100">
                <Icon name="close" className="text-gray-600 text-base" />
              </button>
              <Avatar name={active.buyer.name} url={active.buyer.avatarUrl} />
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-900 truncate">{active.buyer.name}</p>
                <p className="text-xs text-gray-400 truncate">{active.vehicle.brand} {active.vehicle.model}</p>
              </div>
              {active.buyer.phone && (
                <a
                  href={`https://wa.me/55${active.buyer.phone.replace(/\D/g, "")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-green-500 px-3 py-1.5 text-xs font-black text-white hover:opacity-90 transition shrink-0"
                >
                  <Icon name="chat" className="text-sm" /> WhatsApp
                </a>
              )}
            </div>

            {/* Mover etapa */}
            <div className="flex gap-1.5 px-4 py-2 border-b border-black/10 overflow-x-auto">
              {COLUMNS.map(col => (
                <button
                  key={col.key}
                  onClick={() => moveCol(active.id, col.key)}
                  className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider transition ${colMap[active.id] === col.key ? "bg-primary-container text-black" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                >
                  {col.title}
                </button>
              ))}
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {msgLoading && (
                <div className="flex items-center justify-center py-8">
                  <span className="h-6 w-6 rounded-full border-2 border-primary-container/30 border-t-primary-container animate-spin" />
                </div>
              )}
              {!msgLoading && messages.map(m => {
                const mine = m.senderId === userId;
                return (
                  <div key={m.id} className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                    {!mine && <Avatar name={m.sender.name} url={m.sender.avatarUrl} size="sm" />}
                    <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${mine ? "rounded-br-none bg-primary-container text-black" : "rounded-bl-none bg-white border border-black/10 text-gray-800"}`}>
                      <p className="text-sm leading-snug">{m.text}</p>
                      <p className={`text-[10px] mt-1 ${mine ? "text-black/50 text-right" : "text-gray-400"}`}>{timeAgo(m.createdAt)}</p>
                    </div>
                    {mine && <Avatar name={m.sender.name} url={m.sender.avatarUrl} size="sm" />}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-black/10 flex gap-2">
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Escreva uma mensagem…"
                className="flex-1 rounded-xl border border-black/10 bg-gray-100 px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-primary-container/50 focus:bg-white transition"
              />
              <button
                onClick={sendMessage}
                disabled={!text.trim() || sending}
                className="rounded-xl bg-primary-container px-4 py-2.5 text-black hover:opacity-90 disabled:opacity-40 transition"
              >
                <Icon name="send" className="text-base" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerta de não respondidos */}
      {totalUnread > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-6 flex items-start gap-3">
          <Icon name="local_fire_department" className="text-red-500 text-lg shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-red-900">Tempo de resposta é um dos maiores fatores de conversão</p>
            <p className="text-xs text-red-600">Você tem <span className="font-black">{totalUnread} lead{totalUnread > 1 ? "s" : ""} novo{totalUnread > 1 ? "s" : ""}</span> aguardando resposta.</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <span className="h-8 w-8 rounded-full border-2 border-primary-container/30 border-t-primary-container animate-spin" />
        </div>
      )}

      {/* Kanban */}
      {!loading && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {COLUMNS.map(col => {
              const colLeads = leads.filter(c => colMap[c.id] === col.key);
              return (
                <div key={col.key} className="w-72 flex flex-col rounded-xl border border-black/10 bg-gray-50">
                  {/* Cabeçalho da coluna */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                      <h3 className="text-sm font-black text-gray-800">{col.title}</h3>
                    </div>
                    <span className="text-xs font-bold text-gray-400">{colLeads.length}</span>
                  </div>

                  {/* Cards */}
                  <div className="flex flex-col gap-2.5 p-3 flex-1">
                    {colLeads.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <p className="text-xs text-gray-300 font-bold">Nenhum lead aqui</p>
                      </div>
                    )}
                    {colLeads.map(c => {
                      const lastMsg = c.messages[0];
                      const isUnread = lastMsg && lastMsg.senderId !== userId;
                      const cover = c.vehicle.photos[0]?.url;
                      const nextCol = NEXT_COL[col.key];

                      return (
                        <div
                          key={c.id}
                          onClick={() => setActive(c)}
                          className={`cursor-pointer rounded-xl border bg-white p-3 hover:shadow-md hover:border-yellow-300 transition ${isUnread ? "border-red-200 shadow-sm" : "border-black/10"}`}
                        >
                          {/* Alerta de não lido */}
                          {isUnread && (
                            <div className="mb-2 flex items-center gap-1.5 rounded-md bg-red-50 border border-red-200 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-red-600">
                              <Icon name="mark_unread_chat_alt" className="text-xs" /> Aguardando resposta
                            </div>
                          )}

                          {/* Nome + veículo */}
                          <div className="flex items-start gap-2.5">
                            <Avatar name={c.buyer.name} url={c.buyer.avatarUrl} size="sm" />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm truncate ${isUnread ? "font-black text-gray-900" : "font-bold text-gray-800"}`}>{c.buyer.name}</p>
                              <p className="text-xs text-gray-400 truncate">{c.vehicle.brand} {c.vehicle.model}</p>
                            </div>
                            {cover && (
                              <div className="h-9 w-12 rounded-md overflow-hidden bg-gray-100 shrink-0">
                                <Image src={cover} alt="" width={48} height={36} className="object-cover w-full h-full" />
                              </div>
                            )}
                          </div>

                          {/* Última mensagem */}
                          {lastMsg && (
                            <p className="mt-2 text-xs text-gray-500 line-clamp-2 leading-snug">
                              {lastMsg.senderId === userId ? <span className="text-gray-400">Você: </span> : null}
                              {lastMsg.text}
                            </p>
                          )}

                          {/* Footer */}
                          <div className="mt-3 flex items-center justify-between gap-2">
                            <span className="text-[10px] text-gray-400">{timeAgo(c.updatedAt)}</span>
                            <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                              {c.buyer.phone && (
                                <a
                                  href={`https://wa.me/55${c.buyer.phone.replace(/\D/g, "")}`}
                                  target="_blank" rel="noopener noreferrer"
                                  className="flex items-center justify-center rounded-md bg-green-500 p-1.5 text-white hover:opacity-90"
                                  title="WhatsApp"
                                >
                                  <Icon name="chat" className="text-[11px]" />
                                </a>
                              )}
                              {nextCol && (
                                <button
                                  onClick={() => moveCol(c.id, nextCol)}
                                  className="flex items-center gap-1 rounded-md border border-black/10 px-2 py-1 text-[10px] font-black text-gray-600 hover:bg-gray-100 transition"
                                  title={`Mover para ${COLUMNS.find(col => col.key === nextCol)?.title}`}
                                >
                                  Mover <Icon name="chevron_right" className="text-[10px]" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && leads.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Icon name="forum" className="text-5xl text-gray-200 mb-4" />
          <p className="text-lg font-black text-gray-400">Nenhum lead ainda</p>
          <p className="text-sm text-gray-400 mt-1">Quando compradores enviarem mensagens para seus veículos, aparecerão aqui.</p>
        </div>
      )}
    </ErpLayout>
  );
}
