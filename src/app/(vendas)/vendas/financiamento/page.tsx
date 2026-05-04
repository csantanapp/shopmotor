"use client";

import { useState, useEffect, useCallback } from "react";
import ErpLayout from "@/components/erp/ErpLayout";
import ErpKpiCard from "@/components/erp/ErpKpiCard";
import Icon from "@/components/ui/Icon";

interface Nota { texto: string; autorNome: string; createdAt: string; }

interface Lead {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  cidade: string;
  nascimento: string;
  valorCarro: number;
  entrada: number;
  financiado: number;
  parcelas: number;
  pmt: number;
  prazo: string;
  status: string;
  notas?: Nota[];
  createdAt: string;
  storeSlug?: string;
}

const STATUS_OPTIONS = [
  { val: "novo",       label: "Novo",       cls: "bg-blue-100 text-blue-700 border-blue-300" },
  { val: "contatado",  label: "Contatado",  cls: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  { val: "convertido", label: "Convertido", cls: "bg-green-100 text-green-700 border-green-300" },
  { val: "descartado", label: "Descartado", cls: "bg-gray-100 text-gray-500 border-gray-300" },
];

const STATUS_TO_CRM: Record<string, string> = {
  novo: "novo", contatado: "atendimento", convertido: "vendido", descartado: "perdido",
};

function statusStyle(s: string) {
  return STATUS_OPTIONS.find(o => o.val === s)?.cls ?? "bg-gray-100 text-gray-500 border-gray-300";
}
function statusLabel(s: string) {
  return STATUS_OPTIONS.find(o => o.val === s)?.label ?? s;
}
function timeAgo(dateStr: string) {
  const m = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}
function fmtBrl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
const chanceCls = (entrada: number, valorCarro: number) => {
  if (entrada >= valorCarro * 0.3)  return { cls: "bg-green-100 text-green-700",  label: "Alta" };
  if (entrada >= valorCarro * 0.15) return { cls: "bg-yellow-100 text-yellow-700", label: "Média" };
  return { cls: "bg-red-100 text-red-600", label: "Baixa" };
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 border-b border-black/5 last:border-0">
      <p className="text-xs text-gray-400 font-bold shrink-0">{label}</p>
      <p className="text-sm font-black text-gray-900 text-right">{value}</p>
    </div>
  );
}

export default function FinanciamentoPage() {
  const [leads, setLeads]       = useState<Lead[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [filter, setFilter]     = useState("todos");
  const [toast, setToast]       = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  // Drawer state
  const [selected, setSelected] = useState<Lead | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [notaText, setNotaText] = useState("");
  const [addingNota, setAddingNota] = useState(false);

  const fire = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async (status?: string) => {
    setLoading(true);
    const qs = status && status !== "todos" ? `?status=${status}` : "";
    const res = await fetch(`/api/perfil/leads-financiamento${qs}`);
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Erro ao carregar leads"); setLoading(false); return; }
    setLeads(data.items ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(filter); }, [load, filter]);

  async function openLead(lead: Lead) {
    setSelected({ ...lead, notas: lead.notas ?? [] });
    setNotaText("");
    setDrawerLoading(true);
    const res = await fetch(`/api/perfil/leads-financiamento/${lead.id}`);
    const data = await res.json();
    if (data.lead) setSelected(data.lead);
    setDrawerLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    const res = await fetch(`/api/perfil/leads-financiamento/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
      fire("Status atualizado");
    }
    setUpdating(null);
  }

  async function addNota() {
    if (!notaText.trim() || !selected) return;
    setAddingNota(true);
    const res = await fetch(`/api/perfil/leads-financiamento/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addNota: notaText.trim(), autorNome: "Atendente" }),
    });
    const data = await res.json();
    if (data.notas) {
      setSelected(prev => prev ? { ...prev, notas: data.notas } : null);
      setNotaText("");
    }
    setAddingNota(false);
  }

  const novos      = leads.filter(l => l.status === "novo").length;
  const contatados = leads.filter(l => l.status === "contatado").length;
  const convertidos = leads.filter(l => l.status === "convertido").length;
  const chance = selected ? chanceCls(selected.entrada, selected.valorCarro) : null;

  return (
    <ErpLayout title="Financiamento" subtitle="Leads de financiamento recebidos no seu perfil">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-2xl">{toast}</div>
      )}

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setSelected(null)} />
          <div className="w-full max-w-sm bg-white flex flex-col shadow-2xl border-l border-black/10 overflow-y-auto">
            {/* Drawer header */}
            <div className="sticky top-0 bg-white flex items-center gap-3 p-4 border-b border-black/10 z-10">
              <button onClick={() => setSelected(null)} className="rounded-lg border border-black/10 p-1.5 hover:bg-gray-100">
                <Icon name="close" className="text-gray-600 text-base" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-900 truncate">{selected.nome}</p>
                <p className="text-xs text-gray-400">Lead de financiamento</p>
              </div>
              <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase ${statusStyle(selected.status)}`}>
                {statusLabel(selected.status)}
              </span>
            </div>

            {drawerLoading ? (
              <div className="flex items-center justify-center flex-1 py-16">
                <span className="h-6 w-6 rounded-full border-2 border-primary-container/30 border-t-primary-container animate-spin" />
              </div>
            ) : (
              <div className="p-4 space-y-5 flex-1">

                {/* Chance badge */}
                {chance && (
                  <div className={`rounded-xl px-4 py-3 flex items-center gap-3 ${chance.cls}`}>
                    <Icon name={chance.label === "Alta" ? "trending_up" : chance.label === "Média" ? "trending_flat" : "trending_down"} className="text-xl" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider">Chance de conversão: {chance.label}</p>
                      <p className="text-xs mt-0.5 opacity-80">Entrada de {Math.round((selected.entrada / selected.valorCarro) * 100)}% do valor do carro</p>
                    </div>
                  </div>
                )}

                {/* Dados pessoais */}
                <div className="rounded-xl border border-black/10 bg-white p-4">
                  <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-3">Dados pessoais</p>
                  <DetailRow label="Nome" value={selected.nome} />
                  <DetailRow label="Nascimento" value={selected.nascimento} />
                  <DetailRow label="Cidade" value={selected.cidade} />
                  <DetailRow label="WhatsApp" value={selected.whatsapp} />
                  <DetailRow label="E-mail" value={selected.email} />
                  <DetailRow label="Prazo de compra" value={selected.prazo} />
                </div>

                {/* Simulação */}
                <div className="rounded-xl border border-black/10 bg-white p-4">
                  <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-3">Simulação de financiamento</p>
                  <DetailRow label="Valor do veículo" value={fmtBrl(selected.valorCarro)} />
                  <DetailRow label="Entrada" value={fmtBrl(selected.entrada)} />
                  <DetailRow label="Valor financiado" value={fmtBrl(selected.financiado)} />
                  <DetailRow label="Parcelas" value={`${selected.parcelas}×`} />
                  <DetailRow label="Parcela estimada" value={fmtBrl(selected.pmt)} />
                </div>

                {/* Ações rápidas */}
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/55${selected.whatsapp.replace(/\D/g, "")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 py-2.5 text-sm font-black text-white hover:opacity-90 transition"
                  >
                    <Icon name="chat" className="text-sm" /> WhatsApp
                  </a>
                  <a
                    href={`mailto:${selected.email}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-black/10 py-2.5 text-sm font-black text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Icon name="mail" className="text-sm" /> E-mail
                  </a>
                </div>

                {/* Alterar status */}
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Etapa do atendimento</p>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUS_OPTIONS.map(opt => (
                      <button
                        key={opt.val}
                        onClick={() => updateStatus(selected.id, opt.val)}
                        disabled={updating === selected.id}
                        className={`rounded-xl border px-3 py-2 text-xs font-black transition ${selected.status === opt.val ? opt.cls + " ring-2 ring-offset-1 ring-primary-container/40" : "border-black/10 text-gray-500 hover:bg-gray-50"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] text-gray-400">
                    No CRM de Leads este atendimento aparece como:
                    <span className="font-black text-gray-600"> {STATUS_TO_CRM[selected.status] ?? selected.status}</span>
                  </p>
                </div>

                {/* Anotações */}
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-3">Anotações da negociação</p>
                  {(!selected.notas || selected.notas.length === 0) && (
                    <div className="rounded-xl border border-dashed border-black/10 py-6 text-center mb-3">
                      <Icon name="sticky_note_2" className="text-3xl text-gray-200 mb-1" />
                      <p className="text-xs text-gray-400">Nenhuma anotação ainda</p>
                    </div>
                  )}
                  {selected.notas && selected.notas.map((n, i) => (
                    <div key={i} className="mb-2 rounded-xl border border-black/5 bg-yellow-50 p-3">
                      <p className="text-sm text-gray-800 leading-relaxed">{n.texto}</p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <p className="text-[10px] font-bold text-gray-400">{n.autorNome}</p>
                        <p className="text-[10px] text-gray-400">{timeAgo(n.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                  <textarea
                    value={notaText}
                    onChange={e => setNotaText(e.target.value)}
                    rows={3}
                    placeholder="Escreva uma anotação sobre este lead…"
                    className="w-full rounded-xl border border-black/10 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-primary-container/50 focus:bg-white resize-none transition"
                  />
                  <button
                    onClick={addNota}
                    disabled={!notaText.trim() || addingNota}
                    className="mt-2 w-full rounded-xl bg-primary-container py-2.5 text-sm font-black text-black disabled:opacity-40 hover:opacity-90 transition"
                  >
                    Salvar anotação
                  </button>
                </div>

                <p className="text-[10px] text-gray-300 text-center pb-2">Recebido {timeAgo(selected.createdAt)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <ErpKpiCard label="Novos" value={String(novos)} icon="account_balance" accent={novos > 0} />
        <ErpKpiCard label="Contatados" value={String(contatados)} icon="phone" />
        <ErpKpiCard label="Convertidos" value={String(convertidos)} icon="check_circle" />
        <ErpKpiCard label="Total" value={String(leads.length)} icon="bar_chart" />
      </div>

      {error && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 mb-6 flex items-start gap-3">
          <Icon name="workspace_premium" className="text-yellow-600 text-xl shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-yellow-900">Plano Elite necessário</p>
            <p className="text-sm text-yellow-700 mt-1">
              Leads de financiamento são exclusivos para lojistas com plano Elite ativo.
              Faça upgrade em <strong>Configurações → Plano</strong>.
            </p>
          </div>
        </div>
      )}

      {!error && (
        <>
          <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 flex items-start gap-3">
            <Icon name="local_fire_department" className="text-yellow-600 text-lg shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-black text-yellow-900">Cliente que simula financiamento tem 3× mais chance de fechar</p>
              <p className="text-xs text-yellow-700">Priorize esses leads e envie a proposta em até 1 hora.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {[{ val: "todos", label: "Todos" }, ...STATUS_OPTIONS].map(f => (
              <button
                key={f.val}
                onClick={() => setFilter(f.val)}
                className={`rounded-xl border px-3 py-1.5 text-sm font-bold transition ${filter === f.val ? "border-primary-container bg-primary-container/10 text-yellow-700" : "border-black/10 bg-white text-gray-500 hover:bg-gray-50"}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-24">
              <span className="h-8 w-8 rounded-full border-2 border-primary-container/30 border-t-primary-container animate-spin" />
            </div>
          )}

          {!loading && leads.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Icon name="account_balance" className="text-5xl text-gray-200 mb-4" />
              <p className="text-lg font-black text-gray-400">Nenhum lead ainda</p>
              <p className="text-sm text-gray-400 mt-1">Quando compradores simularem financiamento no seu perfil, aparecerão aqui.</p>
            </div>
          )}

          {!loading && leads.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-black/10 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400 border-b border-black/10">
                  <tr>
                    {["Cliente", "Contato", "Valor do carro", "Entrada / Prazo", "Parcela est.", "Chance", "Status", "Recebido", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-black whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {leads.map(l => {
                    const ch = chanceCls(l.entrada, l.valorCarro);
                    return (
                      <tr
                        key={l.id}
                        onClick={() => openLead(l)}
                        className="hover:bg-yellow-50 cursor-pointer transition group"
                      >
                        <td className="px-4 py-4">
                          <p className="font-black text-gray-900 group-hover:text-yellow-800">{l.nome}</p>
                          <p className="text-xs text-gray-400">{l.cidade}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-gray-700">{l.whatsapp}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[160px]">{l.email}</p>
                        </td>
                        <td className="px-4 py-4 font-black text-gray-900 whitespace-nowrap">
                          {fmtBrl(l.valorCarro)}
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-600 whitespace-nowrap">
                          {fmtBrl(l.entrada)} · {l.parcelas}×
                        </td>
                        <td className="px-4 py-4 font-bold text-gray-800 whitespace-nowrap">
                          {fmtBrl(l.pmt)}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-black ${ch.cls}`}>{ch.label}</span>
                        </td>
                        <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                          <select
                            value={l.status}
                            disabled={updating === l.id}
                            onChange={e => updateStatus(l.id, e.target.value)}
                            className={`rounded-full border px-2 py-0.5 text-xs font-black outline-none cursor-pointer ${statusStyle(l.status)}`}
                          >
                            {STATUS_OPTIONS.map(o => (
                              <option key={o.val} value={o.val}>{o.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-400 whitespace-nowrap">{timeAgo(l.createdAt)}</td>
                        <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                          <div className="flex justify-end gap-1.5">
                            <a
                              href={`https://wa.me/55${l.whatsapp.replace(/\D/g, "")}`}
                              target="_blank" rel="noopener noreferrer"
                              className="rounded-md bg-green-500 p-1.5 text-white hover:opacity-90 transition"
                            >
                              <Icon name="chat" className="text-sm" />
                            </a>
                            <a
                              href={`mailto:${l.email}`}
                              className="rounded-md border border-black/10 p-1.5 text-gray-500 hover:bg-gray-100 transition"
                            >
                              <Icon name="mail" className="text-sm" />
                            </a>
                            <button
                              onClick={() => openLead(l)}
                              className="rounded-md border border-black/10 p-1.5 text-gray-500 hover:bg-gray-100 transition"
                              title="Ver detalhes"
                            >
                              <Icon name="open_in_new" className="text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </ErpLayout>
  );
}
