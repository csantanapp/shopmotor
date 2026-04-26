"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/context/AuthContext";

interface ConvUser { id: string; name: string; avatarUrl: string | null; email: string | null; phone: string | null; sharePhone: boolean; }
interface Vehicle { id: string; brand: string; model: string; photos: { url: string }[]; }
interface MsgSender { id: string; name: string; avatarUrl: string | null; }
interface Message { id: string; text: string; senderId: string; createdAt: string; sender: MsgSender; }
interface Conversation {
  id: string;
  vehicle: Vehicle;
  buyer: ConvUser;
  seller: ConvUser;
  messages: Message[];
  updatedAt: string;
}

function Avatar({ user, size = 10 }: { user: ConvUser; size?: number }) {
  const cls = `w-${size} h-${size} rounded-full overflow-hidden bg-surface-container flex items-center justify-center flex-shrink-0`;
  return (
    <div className={cls}>
      {user.avatarUrl
        ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
        : <span className="font-black text-on-surface-variant" style={{ fontSize: size * 1.6 }}>{user.name.charAt(0).toUpperCase()}</span>
      }
    </div>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (diff < 604800000) return d.toLocaleDateString("pt-BR", { weekday: "short" });
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

// ── Componente de contato do comprador ───────────────────────────────────────

function BuyerContact({ other, canSeeContact, isSeller, isPJ }: {
  other: ConvUser;
  canSeeContact: boolean;
  isSeller: boolean;
  isPJ: boolean;
}) {
  // Só lojistas PJ veem dados de contato (ou o aviso de bloqueio)
  if (!isSeller || !isPJ) return null;

  if (!canSeeContact) {
    return (
      <div className="flex items-center gap-1.5 mt-1 bg-surface-container rounded-lg px-3 py-1.5 w-fit">
        <Icon name="lock" className="text-xs text-outline" />
        <span className="text-[11px] text-outline">
          E-mail e telefone disponíveis nos planos{" "}
          <Link href="/planos" className="text-primary font-semibold underline underline-offset-2">PRO e ELITE</Link>
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
      {other.email && (
        <a href={`mailto:${other.email}`}
          className="text-[11px] text-on-surface-variant flex items-center gap-1 hover:text-primary transition-colors">
          <Icon name="email" className="text-xs" />{other.email}
        </a>
      )}
      {other.sharePhone && other.phone && (
        <span className="flex items-center gap-1.5">
          <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
            <Icon name="phone" className="text-xs" />{other.phone}
          </span>
          <a
            href={`https://wa.me/55${other.phone.replace(/\D/g, "")}?text=Olá! Vi sua mensagem no ShopMotor sobre o veículo anunciado.`}
            target="_blank"
            title="Chamar no WhatsApp"
            className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/15 hover:bg-green-500/30 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-green-500">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.558 4.14 1.533 5.874L0 24l6.343-1.516A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.213-3.736.893.953-3.625-.235-.374A9.818 9.818 0 1112 21.818z"/>
            </svg>
          </a>
        </span>
      )}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function MensagensPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [canSeeContact, setCanSeeContact] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login?redirect=/perfil/mensagens");
  }, [user, authLoading, router]);

  const activeConv = conversations.find(c => c.id === activeId) ?? null;
  const other = activeConv ? (activeConv.buyer.id === user?.id ? activeConv.seller : activeConv.buyer) : null;
  const isSeller = activeConv ? activeConv.seller.id === user?.id : false;
  const isPJ = user?.accountType === "PJ";

  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeId;

  const fetchConversations = useCallback(async (initial = false) => {
    try {
      const r = await fetch("/api/conversations");
      const d = await r.json();
      const convs: Conversation[] = d.conversations ?? [];
      setConversations(convs);
      setCanSeeContact(d.canSeeContact ?? false);
      if (initial && convs.length > 0) setActiveId(convs[0].id);
    } catch (err) {
      console.error("[conversations]", err);
    } finally {
      if (initial) setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (convId: string, silent = false) => {
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`);
      const d = await res.json();
      const incoming: Message[] = d.messages ?? [];
      setMessages(prev => {
        if (silent && prev.length === incoming.length) return prev;
        const shouldScroll = silent ? incoming.length > prev.length : true;
        if (shouldScroll) setTimeout(() => {
          const c = messagesContainerRef.current;
          if (c) c.scrollTop = c.scrollHeight;
        }, 50);
        return incoming;
      });
    } catch (err) {
      console.error("[messages]", err);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;
    fetchConversations(true);
  }, [authLoading, user, fetchConversations]);

  // Polling a cada 3s
  useEffect(() => {
    if (authLoading || !user) return;
    const interval = setInterval(async () => {
      fetchConversations();
      if (activeIdRef.current) fetchMessages(activeIdRef.current, true);
    }, 3000);
    return () => clearInterval(interval);
  }, [authLoading, user, fetchConversations, fetchMessages]);

  useEffect(() => {
    if (activeId) fetchMessages(activeId);
  }, [activeId, fetchMessages]);

  async function sendMessage() {
    if (!input.trim() || !activeId || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    const res = await fetch(`/api/conversations/${activeId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const d = await res.json();
    if (d.message) {
      setMessages(prev => [...prev, d.message]);
      setTimeout(() => {
        const c = messagesContainerRef.current;
        if (c) c.scrollTop = c.scrollHeight;
      }, 50);
      setConversations(prev => prev.map(c =>
        c.id === activeId ? { ...c, messages: [d.message], updatedAt: d.message.createdAt } : c
      ));
    }
    setSending(false);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="w-8 h-8 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-[calc(100vh-80px-64px-64px)] md:h-[calc(100vh-80px-64px)] flex gap-0 rounded-2xl overflow-hidden shadow-sm border border-outline-variant/30">

      {/* Lista de conversas */}
      <div className="w-72 flex-shrink-0 bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col">
        <div className="p-4 border-b border-outline-variant/20">
          <h2 className="font-black text-lg uppercase tracking-tight text-on-surface">Mensagens</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
              <Icon name="chat_bubble_outline" className="text-4xl text-outline mb-3" />
              <p className="text-sm font-bold text-on-surface mb-1">Nenhuma conversa</p>
              <p className="text-xs text-on-surface-variant">Envie uma proposta em um anúncio para iniciar.</p>
            </div>
          ) : (
            conversations.map(conv => {
              const convOther = conv.buyer.id === user?.id ? conv.seller : conv.buyer;
              const lastMsg = conv.messages[0];
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveId(conv.id)}
                  className={`w-full flex items-start gap-3 px-4 py-4 text-left transition-colors border-b border-outline-variant/10 ${activeId === conv.id ? "bg-primary-container/15" : "hover:bg-surface-container"}`}
                >
                  <Avatar user={convOther} size={10} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-on-surface truncate">{convOther.name}</span>
                      {lastMsg && <span className="text-[10px] text-outline ml-2 flex-shrink-0">{formatTime(lastMsg.createdAt)}</span>}
                    </div>
                    <p className="text-[10px] text-primary font-semibold truncate">{conv.vehicle.brand} {conv.vehicle.model}</p>
                    {lastMsg && <p className="text-xs text-on-surface-variant truncate mt-0.5">{lastMsg.text}</p>}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat */}
      {activeConv && other ? (
        <div className="flex-1 flex flex-col bg-surface min-w-0">
          {/* Header */}
          <div className="px-6 py-4 border-b border-outline-variant/20 bg-surface-container-lowest flex items-center gap-4 flex-shrink-0">
            <Avatar user={other} size={10} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-on-surface">{other.name}</p>
              <Link href={`/carro/${activeConv.vehicle.id}`} className="text-[10px] text-primary font-semibold hover:underline block truncate">
                {activeConv.vehicle.brand} {activeConv.vehicle.model}
              </Link>
              <BuyerContact other={other} canSeeContact={canSeeContact} isSeller={isSeller} isPJ={isPJ} />
            </div>
          </div>

          {/* Mensagens */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-3">
            {messages.map(msg => {
              const isMe = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm ${isMe ? "bg-primary-container text-on-primary-container rounded-br-sm" : "bg-surface-container-lowest text-on-surface shadow-sm rounded-bl-sm"}`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <p className={`text-[10px] mt-1 text-right ${isMe ? "text-on-primary-container/60" : "text-outline"}`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-lowest flex-shrink-0">
            <div className="flex items-center gap-3">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-surface-container rounded-full px-5 py-3 text-sm border-0 focus:ring-2 focus:ring-primary-container outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${input.trim() ? "bg-primary-container text-on-primary-container" : "bg-surface-container text-outline"}`}
              >
                {sending
                  ? <span className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />
                  : <Icon name="send" className="text-lg" />
                }
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center bg-surface">
          <Icon name="chat_bubble_outline" className="text-6xl text-outline mb-4" />
          <p className="font-bold text-on-surface">Selecione uma conversa</p>
        </div>
      )}

    </div>
  );
}
