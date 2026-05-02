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
  vehicle: {
    id: string;
    brand: string;
    model: string;
    photos: { url: string }[];
  };
  buyer: { id: string; name: string; avatarUrl?: string | null; phone?: string | null; email?: string | null };
  seller: { id: string; name: string; avatarUrl?: string | null };
  messages: ApiMessage[];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

export default function LeadsPage() {
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [active, setActive] = useState<ApiConversation | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    const res = await fetch("/api/conversations");
    const data = await res.json();
    const convs: ApiConversation[] = data.conversations ?? [];
    // Mostra apenas conversas onde o usuário é vendedor (leads recebidos)
    const sellerConvs = convs.filter(c => c.sellerId === data.conversations?.[0]?.sellerId || true);
    setConversations(convs);
    // Detecta o userId do usuário logado (é sempre o sellerId em conv onde é vendedor)
    const sellerConv = convs.find(c => c.sellerId !== c.buyerId);
    if (sellerConv) setUserId(sellerConv.sellerId);
  }, []);

  useEffect(() => {
    loadConversations().finally(() => setLoading(false));
  }, [loadConversations]);

  // Quando muda a conversa ativa, carrega mensagens
  useEffect(() => {
    if (!active) return;
    setMsgLoading(true);
    fetch(`/api/conversations/${active.id}/messages`)
      .then(r => r.json())
      .then(d => setMessages(d.messages ?? []))
      .finally(() => setMsgLoading(false));
  }, [active]);

  // Scroll automático
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      // Atualiza última mensagem na lista
      setConversations(prev => prev.map(c =>
        c.id === active.id ? { ...c, messages: [data.message], updatedAt: data.message.createdAt } : c
      ));
    }
    setSending(false);
  }

  // Conversas onde o usuário logado é o vendedor (leads recebidos)
  const sellerConvs = conversations.filter(c => c.sellerId === userId);
  // Conversas onde o usuário é comprador (enviadas)
  const buyerConvs  = conversations.filter(c => c.buyerId  === userId);
  // Para o CRM, mostramos as do vendedor em destaque
  const displayed = userId
    ? [...sellerConvs, ...buyerConvs]
    : conversations;

  const filtered = displayed.filter(c => {
    const q = search.toLowerCase();
    return !q || c.buyer.name.toLowerCase().includes(q) || `${c.vehicle.brand} ${c.vehicle.model}`.toLowerCase().includes(q);
  });

  // Separa não lidas (última msg não é do userId logado) e lidas
  const unread = filtered.filter(c => c.messages[0] && c.messages[0].senderId !== userId);
  const read   = filtered.filter(c => !c.messages[0] || c.messages[0].senderId === userId);

  return (
    <ErpLayout title="CRM — Mensagens" subtitle="Conversas com compradores interessados nos seus veículos">
      <div className="flex gap-4 h-[calc(100vh-10rem)] min-h-[500px]">

        {/* Lista de conversas */}
        <div className={`flex flex-col rounded-xl border border-black/10 bg-white shadow-sm overflow-hidden ${active ? "hidden md:flex w-80 shrink-0" : "flex-1 md:w-80 md:flex-none"}`}>
          <div className="p-3 border-b border-black/10">
            <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-gray-50 px-3 py-2">
              <Icon name="search" className="text-sm text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar leads…"
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-16">
                <span className="h-6 w-6 rounded-full border-2 border-primary-container/30 border-t-primary-container animate-spin" />
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <Icon name="chat" className="text-4xl text-gray-200 mb-3" />
                <p className="text-sm font-black text-gray-400">Nenhuma mensagem ainda</p>
                <p className="text-xs text-gray-400 mt-1">Quando compradores entrarem em contato, aparecerão aqui.</p>
              </div>
            )}

            {!loading && unread.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-wider text-red-500">
                  Não respondidas ({unread.length})
                </p>
                {unread.map(c => <ConvItem key={c.id} c={c} userId={userId} active={active} onClick={() => setActive(c)} />)}
              </div>
            )}

            {!loading && read.length > 0 && (
              <div>
                {unread.length > 0 && (
                  <p className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Outras ({read.length})
                  </p>
                )}
                {read.map(c => <ConvItem key={c.id} c={c} userId={userId} active={active} onClick={() => setActive(c)} />)}
              </div>
            )}
          </div>
        </div>

        {/* Painel de chat */}
        {active ? (
          <div className="flex-1 flex flex-col rounded-xl border border-black/10 bg-white shadow-sm overflow-hidden">
            {/* Header do chat */}
            <div className="flex items-center gap-3 p-4 border-b border-black/10">
              <button onClick={() => setActive(null)} className="md:hidden rounded-lg border border-black/10 p-1.5 hover:bg-gray-100">
                <Icon name="arrow_back" className="text-gray-600 text-base" />
              </button>
              <Avatar name={active.buyer.name} url={active.buyer.avatarUrl} />
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-900 truncate">{active.buyer.name}</p>
                <p className="text-xs text-gray-400 truncate">
                  {active.vehicle.brand} {active.vehicle.model}
                  {active.buyer.phone && <span className="ml-2">· {active.buyer.phone}</span>}
                </p>
              </div>
              {/* Foto do veículo */}
              <div className="hidden md:block h-10 w-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {active.vehicle.photos[0] ? (
                  <Image src={active.vehicle.photos[0].url} alt="" width={64} height={40} className="object-cover w-full h-full" />
                ) : (
                  <div className="flex h-full items-center justify-center"><Icon name="directions_car" className="text-gray-300 text-lg" /></div>
                )}
              </div>
              {active.buyer.phone && (
                <a
                  href={`https://wa.me/55${active.buyer.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-green-500 px-3 py-1.5 text-xs font-black text-white hover:opacity-90 transition"
                >
                  <Icon name="chat" className="text-sm" /> WhatsApp
                </a>
              )}
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
                    <div className={`max-w-xs md:max-w-md rounded-2xl px-3.5 py-2.5 ${mine ? "rounded-br-none bg-primary-container text-black" : "rounded-bl-none bg-white border border-black/10 text-gray-800"}`}>
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
        ) : (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center rounded-xl border border-black/10 bg-white shadow-sm text-center gap-3">
            <Icon name="forum" className="text-5xl text-gray-200" />
            <p className="text-base font-black text-gray-400">Selecione uma conversa</p>
            <p className="text-sm text-gray-400">Escolha um lead à esquerda para ver o histórico e responder.</p>
          </div>
        )}
      </div>
    </ErpLayout>
  );
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

function ConvItem({ c, userId, active, onClick }: {
  c: ApiConversation; userId: string; active: ApiConversation | null; onClick: () => void;
}) {
  const lastMsg = c.messages[0];
  const isUnread = lastMsg && lastMsg.senderId !== userId;
  const isActive = active?.id === c.id;
  const cover = c.vehicle.photos[0]?.url;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition border-b border-black/5 last:border-0 ${isActive ? "bg-primary-container/10" : "hover:bg-gray-50"}`}
    >
      <div className="relative shrink-0">
        <Avatar name={c.buyer.name} url={c.buyer.avatarUrl} />
        {isUnread && (
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <p className={`text-sm truncate ${isUnread ? "font-black text-gray-900" : "font-semibold text-gray-700"}`}>{c.buyer.name}</p>
          <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(c.updatedAt)}</span>
        </div>
        <p className="text-xs text-gray-400 truncate">{c.vehicle.brand} {c.vehicle.model}</p>
        {lastMsg && (
          <p className={`text-xs truncate mt-0.5 ${isUnread ? "text-gray-700 font-semibold" : "text-gray-400"}`}>
            {lastMsg.senderId === userId ? "Você: " : ""}{lastMsg.text}
          </p>
        )}
      </div>
      {cover && (
        <div className="h-10 w-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
          <Image src={cover} alt="" width={48} height={40} className="object-cover w-full h-full" />
        </div>
      )}
    </button>
  );
}
