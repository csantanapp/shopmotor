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

interface LeadCrm {
  stage: string;
  tags: string[];
  valorProposta: number | null;
  interesse: string | null;
  motivoPerda: string | null;
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
  crm?: { stage: string; tags: string; valorProposta: number | null; interesse: string | null; motivoPerda: string | null } | null;
}

interface LeadNota {
  id: string;
  texto: string;
  autorNome: string;
  createdAt: string;
}

type ColKey = "novo" | "atendimento" | "proposta" | "vendido" | "perdido";
type PanelTab = "chat" | "crm" | "notas";

const COLUMNS: { key: ColKey; title: string; dot: string; end?: boolean }[] = [
  { key: "novo",        title: "Novo lead",        dot: "bg-blue-400"   },
  { key: "atendimento", title: "Em Atendimento",   dot: "bg-orange-400" },
  { key: "proposta",    title: "Proposta enviada", dot: "bg-purple-400" },
  { key: "vendido",     title: "Vendido",          dot: "bg-green-500", end: true },
  { key: "perdido",     title: "Perdido",          dot: "bg-red-400",   end: true },
];

const ACTIVE_COLS: ColKey[] = ["novo", "atendimento", "proposta"];

const INTERESSE_OPTS = ["Muito interessado", "Interessado", "Pouco interessado", "Só pesquisando"];

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

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export default function LeadsPage() {
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [stageMap, setStageMap] = useState<Record<string, ColKey>>({});
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<ApiConversation | null>(null);
  const [panelTab, setPanelTab] = useState<PanelTab>("chat");
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // CRM state for active lead
  const [crm, setCrm] = useState<LeadCrm>({ stage: "novo", tags: [], valorProposta: null, interesse: null, motivoPerda: null });
  const [crmSaving, setCrmSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [notas, setNotas] = useState<LeadNota[]>([]);
  const [notaText, setNotaText] = useState("");
  const [addingNota, setAddingNota] = useState(false);

  // Encerrar flow
  const [showEncerrar, setShowEncerrar] = useState(false);
  const [encerrarChoice, setEncerrarChoice] = useState<"vendido" | "perdido" | null>(null);
  const [motivoInput, setMotivoInput] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/conversations");
    const data = await res.json();
    const convs: ApiConversation[] = data.conversations ?? [];
    setConversations(convs);
    const me = convs.find(c => c.sellerId)?.sellerId ?? "";
    setUserId(me);

    const initial: Record<string, ColKey> = {};
    convs.forEach(c => {
      const dbStage = c.crm?.stage as ColKey | undefined;
      if (dbStage && COLUMNS.some(col => col.key === dbStage)) {
        initial[c.id] = dbStage;
      } else {
        const last = c.messages[0];
        initial[c.id] = !last || last.senderId === c.buyerId ? "novo" : "atendimento";
      }
    });
    setStageMap(initial);
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  // Load messages when active changes
  useEffect(() => {
    if (!active) return;
    setMsgLoading(true);
    fetch(`/api/conversations/${active.id}/messages`)
      .then(r => r.json())
      .then(d => setMessages(d.messages ?? []))
      .finally(() => setMsgLoading(false));
    // Load CRM data
    fetch(`/api/conversations/${active.id}/crm`)
      .then(r => r.json())
      .then(d => d.crm && setCrm(d.crm));
    // Load notas
    fetch(`/api/conversations/${active.id}/notas`)
      .then(r => r.json())
      .then(d => setNotas(d.notas ?? []));
    setPanelTab("chat");
    setShowEncerrar(false);
    setEncerrarChoice(null);
    setMotivoInput("");
    setTagInput("");
  }, [active]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function moveStage(convId: string, stage: ColKey) {
    setStageMap(prev => ({ ...prev, [convId]: stage }));
    await fetch(`/api/conversations/${convId}/crm`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    if (active?.id === convId) setCrm(prev => ({ ...prev, stage }));
  }

  async function saveCrm(patch: Partial<LeadCrm>) {
    if (!active) return;
    setCrmSaving(true);
    const updated = { ...crm, ...patch };
    setCrm(updated);
    await fetch(`/api/conversations/${active.id}/crm`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setCrmSaving(false);
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
      if (stageMap[active.id] === "novo") moveStage(active.id, "atendimento");
    }
    setSending(false);
  }

  async function addNota() {
    if (!notaText.trim() || !active) return;
    setAddingNota(true);
    const res = await fetch(`/api/conversations/${active.id}/notas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: notaText.trim() }),
    });
    const data = await res.json();
    if (data.nota) { setNotas(prev => [...prev, data.nota]); setNotaText(""); }
    setAddingNota(false);
  }

  async function encerrar() {
    if (!active || !encerrarChoice) return;
    const patch: Partial<LeadCrm> = { stage: encerrarChoice };
    if (encerrarChoice === "perdido" && motivoInput.trim()) patch.motivoPerda = motivoInput.trim();
    await moveStage(active.id, encerrarChoice);
    if (encerrarChoice === "perdido" && motivoInput.trim()) await saveCrm({ motivoPerda: motivoInput.trim() });
    setShowEncerrar(false);
    setActive(null);
  }

  function addTag(tag: string) {
    const t = tag.trim().toLowerCase();
    if (!t || crm.tags.includes(t)) return;
    const updated = [...crm.tags, t];
    setCrm(prev => ({ ...prev, tags: updated }));
    saveCrm({ tags: updated });
    setTagInput("");
  }

  function removeTag(tag: string) {
    const updated = crm.tags.filter(t => t !== tag);
    setCrm(prev => ({ ...prev, tags: updated }));
    saveCrm({ tags: updated });
  }

  const leads = conversations.filter(c => c.sellerId === userId);
  const totalUnread = leads.filter(c => {
    const stage = stageMap[c.id];
    if (stage === "vendido" || stage === "perdido") return false;
    return c.messages[0] && c.messages[0].senderId !== userId;
  }).length;
  const activeStage = active ? stageMap[active.id] : null;

  return (
    <ErpLayout
      title="CRM de Alta Pressão"
      subtitle="Mova leads entre as etapas — responda primeiro os mais quentes"
    >
      {/* Chat/CRM panel slide-over */}
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
              <div className="flex gap-1.5 shrink-0">
                {active.buyer.phone && (
                  <a
                    href={`https://wa.me/55${active.buyer.phone.replace(/\D/g, "")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-xl bg-green-500 px-3 py-1.5 text-xs font-black text-white hover:opacity-90 transition"
                  >
                    <Icon name="chat" className="text-sm" /> WA
                  </a>
                )}
                {activeStage !== "vendido" && activeStage !== "perdido" && (
                  <button
                    onClick={() => setShowEncerrar(true)}
                    className="flex items-center gap-1 rounded-xl bg-gray-100 border border-black/10 px-3 py-1.5 text-xs font-black text-gray-700 hover:bg-gray-200 transition"
                  >
                    <Icon name="check_circle" className="text-sm" /> Encerrar
                  </button>
                )}
              </div>
            </div>

            {/* Encerrar modal overlay */}
            {showEncerrar && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 rounded-none">
                <div className="bg-white rounded-2xl shadow-2xl p-6 mx-4 w-full max-w-sm">
                  <p className="font-black text-gray-900 text-base mb-4">Encerrar atendimento</p>
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => setEncerrarChoice("vendido")}
                      className={`flex-1 rounded-xl border-2 py-3 text-sm font-black transition ${encerrarChoice === "vendido" ? "border-green-500 bg-green-50 text-green-700" : "border-black/10 text-gray-600 hover:border-green-300"}`}
                    >
                      <Icon name="check_circle" className="text-lg block mx-auto mb-1" />
                      Vendido
                    </button>
                    <button
                      onClick={() => setEncerrarChoice("perdido")}
                      className={`flex-1 rounded-xl border-2 py-3 text-sm font-black transition ${encerrarChoice === "perdido" ? "border-red-400 bg-red-50 text-red-600" : "border-black/10 text-gray-600 hover:border-red-300"}`}
                    >
                      <Icon name="cancel" className="text-lg block mx-auto mb-1" />
                      Perdido
                    </button>
                  </div>
                  {encerrarChoice === "perdido" && (
                    <input
                      value={motivoInput}
                      onChange={e => setMotivoInput(e.target.value)}
                      placeholder="Motivo da perda (opcional)"
                      className="w-full mb-4 rounded-xl border border-black/10 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary-container/50"
                    />
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => setShowEncerrar(false)} className="flex-1 rounded-xl border border-black/10 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50">
                      Cancelar
                    </button>
                    <button
                      onClick={encerrar}
                      disabled={!encerrarChoice}
                      className="flex-1 rounded-xl bg-primary-container py-2 text-sm font-black text-black disabled:opacity-40 hover:opacity-90 transition"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Stage bar */}
            <div className="flex gap-1 px-4 py-2 border-b border-black/10 overflow-x-auto">
              {COLUMNS.map(col => (
                <button
                  key={col.key}
                  onClick={() => moveStage(active.id, col.key)}
                  className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider transition ${stageMap[active.id] === col.key ? "bg-primary-container text-black" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                >
                  {col.title}
                </button>
              ))}
            </div>

            {/* Panel tabs */}
            <div className="flex border-b border-black/10">
              {(["chat", "crm", "notas"] as PanelTab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setPanelTab(t)}
                  className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider transition ${panelTab === t ? "border-b-2 border-primary-container text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
                >
                  {t === "chat" ? "Mensagens" : t === "crm" ? "CRM" : "Anotações"}
                </button>
              ))}
            </div>

            {/* ── Chat tab ── */}
            {panelTab === "chat" && (
              <>
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
              </>
            )}

            {/* ── CRM tab ── */}
            {panelTab === "crm" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {crmSaving && <p className="text-[10px] text-gray-400 text-right">Salvando…</p>}

                {/* Interesse */}
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Nível de interesse</p>
                  <div className="flex flex-wrap gap-2">
                    {INTERESSE_OPTS.map(opt => (
                      <button
                        key={opt}
                        onClick={() => saveCrm({ interesse: opt })}
                        className={`rounded-full px-3 py-1 text-xs font-bold border transition ${crm.interesse === opt ? "bg-primary-container border-primary-container text-black" : "border-black/10 text-gray-500 hover:border-gray-300"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Valor da proposta */}
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Valor da proposta (R$)</p>
                  <input
                    type="number"
                    defaultValue={crm.valorProposta ?? ""}
                    onBlur={e => saveCrm({ valorProposta: e.target.value ? Number(e.target.value) : null })}
                    placeholder="Ex: 45000"
                    className="w-full rounded-xl border border-black/10 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary-container/50"
                  />
                  {crm.valorProposta && (
                    <p className="mt-1 text-xs text-gray-400">{fmt(crm.valorProposta)}</p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {crm.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-gray-100 border border-black/10 px-2.5 py-1 text-xs font-bold text-gray-700">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="text-gray-400 hover:text-red-500 transition ml-0.5">
                          <Icon name="close" className="text-[10px]" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && (addTag(tagInput), e.preventDefault())}
                      placeholder="Nova tag (Enter para adicionar)"
                      className="flex-1 rounded-xl border border-black/10 bg-gray-50 px-3 py-2 text-xs outline-none focus:border-primary-container/50"
                    />
                    <button onClick={() => addTag(tagInput)} className="rounded-xl bg-gray-100 border border-black/10 px-3 text-xs font-black text-gray-600 hover:bg-gray-200">
                      +
                    </button>
                  </div>
                </div>

                {/* Motivo de perda */}
                {stageMap[active.id] === "perdido" && (
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Motivo da perda</p>
                    <input
                      defaultValue={crm.motivoPerda ?? ""}
                      onBlur={e => saveCrm({ motivoPerda: e.target.value })}
                      placeholder="Descreva o motivo…"
                      className="w-full rounded-xl border border-black/10 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary-container/50"
                    />
                  </div>
                )}

                {/* Info contato */}
                <div className="rounded-xl border border-black/10 bg-gray-50 p-3 space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Dados do lead</p>
                  {active.buyer.email && <p className="text-xs text-gray-600"><span className="text-gray-400">Email: </span>{active.buyer.email}</p>}
                  {active.buyer.phone && <p className="text-xs text-gray-600"><span className="text-gray-400">Tel: </span>{active.buyer.phone}</p>}
                  <p className="text-xs text-gray-600"><span className="text-gray-400">Veículo: </span>{active.vehicle.brand} {active.vehicle.model}</p>
                </div>
              </div>
            )}

            {/* ── Notas tab ── */}
            {panelTab === "notas" && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {notas.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Icon name="sticky_note_2" className="text-4xl text-gray-200 mb-2" />
                      <p className="text-sm text-gray-400 font-bold">Nenhuma anotação ainda</p>
                      <p className="text-xs text-gray-300 mt-1">Registre informações importantes sobre este lead</p>
                    </div>
                  )}
                  {notas.map(n => (
                    <div key={n.id} className="rounded-xl border border-black/10 bg-yellow-50 p-3">
                      <p className="text-sm text-gray-800 leading-relaxed">{n.texto}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-[10px] text-gray-400 font-bold">{n.autorNome}</p>
                        <p className="text-[10px] text-gray-400">{timeAgo(n.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-black/10 flex flex-col gap-2">
                  <textarea
                    value={notaText}
                    onChange={e => setNotaText(e.target.value)}
                    placeholder="Escreva uma anotação sobre o lead…"
                    rows={3}
                    className="w-full rounded-xl border border-black/10 bg-gray-100 px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-primary-container/50 focus:bg-white transition resize-none"
                  />
                  <button
                    onClick={addNota}
                    disabled={!notaText.trim() || addingNota}
                    className="rounded-xl bg-primary-container py-2 text-sm font-black text-black disabled:opacity-40 hover:opacity-90 transition"
                  >
                    Salvar anotação
                  </button>
                </div>
              </>
            )}
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

      {loading && (
        <div className="flex items-center justify-center py-24">
          <span className="h-8 w-8 rounded-full border-2 border-primary-container/30 border-t-primary-container animate-spin" />
        </div>
      )}

      {!loading && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {COLUMNS.map(col => {
              const colLeads = leads.filter(c => stageMap[c.id] === col.key);
              const NEXT_STAGE: Record<ColKey, ColKey | null> = {
                novo: "atendimento", atendimento: "proposta", proposta: null, vendido: null, perdido: null,
              };
              const nextStage = NEXT_STAGE[col.key];

              return (
                <div key={col.key} className={`w-72 flex flex-col rounded-xl border bg-gray-50 ${col.end ? "border-dashed border-black/10 opacity-80" : "border-black/10"}`}>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                      <h3 className="text-sm font-black text-gray-800">{col.title}</h3>
                    </div>
                    <span className="text-xs font-bold text-gray-400">{colLeads.length}</span>
                  </div>

                  <div className="flex flex-col gap-2.5 p-3 flex-1">
                    {colLeads.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <p className="text-xs text-gray-300 font-bold">
                          {col.end ? (col.key === "vendido" ? "Nenhuma venda ainda" : "Nenhum perdido") : "Nenhum lead aqui"}
                        </p>
                      </div>
                    )}
                    {colLeads.map(c => {
                      const lastMsg = c.messages[0];
                      const isUnread = !col.end && lastMsg && lastMsg.senderId !== userId;
                      const cover = c.vehicle.photos[0]?.url;

                      return (
                        <div
                          key={c.id}
                          onClick={() => setActive(c)}
                          className={`cursor-pointer rounded-xl border bg-white p-3 hover:shadow-md hover:border-yellow-300 transition ${isUnread ? "border-red-200 shadow-sm" : "border-black/10"}`}
                        >
                          {isUnread && (
                            <div className="mb-2 flex items-center gap-1.5 rounded-md bg-red-50 border border-red-200 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-red-600">
                              <Icon name="mark_unread_chat_alt" className="text-xs" /> Aguardando resposta
                            </div>
                          )}
                          {col.key === "vendido" && (
                            <div className="mb-2 flex items-center gap-1.5 rounded-md bg-green-50 border border-green-200 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-green-600">
                              <Icon name="check_circle" className="text-xs" /> Vendido
                            </div>
                          )}
                          {col.key === "perdido" && (
                            <div className="mb-2 flex items-center gap-1.5 rounded-md bg-red-50 border border-red-200 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-red-500">
                              <Icon name="cancel" className="text-xs" /> Perdido
                            </div>
                          )}

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

                          {lastMsg && (
                            <p className="mt-2 text-xs text-gray-500 line-clamp-2 leading-snug">
                              {lastMsg.senderId === userId ? <span className="text-gray-400">Você: </span> : null}
                              {lastMsg.text}
                            </p>
                          )}

                          <div className="mt-3 flex items-center justify-between gap-2">
                            <span className="text-[10px] text-gray-400">{timeAgo(c.updatedAt)}</span>
                            {!col.end && (
                              <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                                {c.buyer.phone && (
                                  <a
                                    href={`https://wa.me/55${c.buyer.phone.replace(/\D/g, "")}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex items-center justify-center rounded-md bg-green-500 p-1.5 text-white hover:opacity-90"
                                  >
                                    <Icon name="chat" className="text-[11px]" />
                                  </a>
                                )}
                                {nextStage && (
                                  <button
                                    onClick={() => moveStage(c.id, nextStage)}
                                    className="flex items-center gap-1 rounded-md border border-black/10 px-2 py-1 text-[10px] font-black text-gray-600 hover:bg-gray-100 transition"
                                  >
                                    Mover <Icon name="chevron_right" className="text-[10px]" />
                                  </button>
                                )}
                                <button
                                  onClick={() => { setActive(c); setShowEncerrar(true); }}
                                  className="flex items-center gap-1 rounded-md border border-black/10 px-2 py-1 text-[10px] font-black text-gray-600 hover:bg-gray-100 transition"
                                >
                                  <Icon name="check_circle" className="text-[11px]" />
                                </button>
                              </div>
                            )}
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
