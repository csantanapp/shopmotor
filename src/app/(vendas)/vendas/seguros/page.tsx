"use client";

import { useState, useEffect, useCallback } from "react";
import ErpLayout from "@/components/erp/ErpLayout";
import ErpKpiCard from "@/components/erp/ErpKpiCard";
import Icon from "@/components/ui/Icon";

interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  marca: string;
  modelo: string;
  versao?: string;
  ano: string;
  tipoVeiculo: string;
  usoComercial: boolean;
  blindado: boolean;
  cep: string;
  possuiSeguro: boolean;
  classeBonus?: string;
  status: string;
  createdAt: string;
  storeSlug?: string;
}

const STATUS_OPTIONS = [
  { val: "novo",       label: "Novo",       cls: "bg-blue-100 text-blue-700 border-blue-300" },
  { val: "contatado",  label: "Contatado",  cls: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  { val: "convertido", label: "Convertido", cls: "bg-green-100 text-green-700 border-green-300" },
  { val: "descartado", label: "Descartado", cls: "bg-gray-100 text-gray-500 border-gray-300" },
];

function statusStyle(s: string) {
  return STATUS_OPTIONS.find(o => o.val === s)?.cls ?? "bg-gray-100 text-gray-500 border-gray-300";
}

function timeAgo(dateStr: string) {
  const m = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

export default function SegurosPage() {
  const [leads, setLeads]       = useState<Lead[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [filter, setFilter]     = useState("todos");
  const [toast, setToast]       = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const fire = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async (status?: string) => {
    setLoading(true);
    const qs = status && status !== "todos" ? `?status=${status}` : "";
    const res = await fetch(`/api/perfil/leads-seguro${qs}`);
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Erro ao carregar"); setLoading(false); return; }
    setLeads(data.items ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(filter); }, [load, filter]);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    const res = await fetch("/api/perfil/leads-seguro", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
      fire("Status atualizado");
    }
    setUpdating(null);
  }

  const novos       = leads.filter(l => l.status === "novo").length;
  const contatados  = leads.filter(l => l.status === "contatado").length;
  const convertidos = leads.filter(l => l.status === "convertido").length;

  return (
    <ErpLayout title="Seguro" subtitle="Leads de cotação de seguro recebidos no seu perfil">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-2xl">{toast}</div>
      )}

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <ErpKpiCard label="Novos" value={String(novos)} icon="shield" accent={novos > 0} />
        <ErpKpiCard label="Contatados" value={String(contatados)} icon="phone" />
        <ErpKpiCard label="Convertidos" value={String(convertidos)} icon="check_circle" />
        <ErpKpiCard label="Total" value={String(leads.length)} icon="bar_chart" />
      </div>

      {/* Erro de plano */}
      {error && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 mb-6 flex items-start gap-3">
          <Icon name="workspace_premium" className="text-yellow-600 text-xl shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-yellow-900">Plano Elite necessário</p>
            <p className="text-sm text-yellow-700 mt-1">
              Leads de seguro são exclusivos para lojistas com plano Elite ativo.
              Faça upgrade em <strong>Configurações → Plano</strong>.
            </p>
          </div>
        </div>
      )}

      {!error && (
        <>
          {/* Filtros */}
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

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-24">
              <span className="h-8 w-8 rounded-full border-2 border-primary-container/30 border-t-primary-container animate-spin" />
            </div>
          )}

          {/* Empty */}
          {!loading && leads.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Icon name="shield" className="text-5xl text-gray-200 mb-4" />
              <p className="text-lg font-black text-gray-400">Nenhum lead ainda</p>
              <p className="text-sm text-gray-400 mt-1">Quando compradores solicitarem cotação de seguro no seu perfil, aparecerão aqui.</p>
            </div>
          )}

          {/* Tabela */}
          {!loading && leads.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-black/10 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400 border-b border-black/10">
                  <tr>
                    {["Cliente", "Contato", "Veículo", "Ano / Tipo", "Detalhes", "Status", "Recebido", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-black whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {leads.map(l => (
                    <tr key={l.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-4">
                        <p className="font-black text-gray-900">{l.nome}</p>
                        <p className="text-xs text-gray-400">CEP {l.cep}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-gray-700">{l.telefone}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[160px]">{l.email}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-bold text-gray-900">{l.marca} {l.modelo}</p>
                        {l.versao && <p className="text-xs text-gray-400">{l.versao}</p>}
                      </td>
                      <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                        {l.ano} · <span className="capitalize">{l.tipoVeiculo}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {l.usoComercial && <span className="rounded-full bg-orange-100 text-orange-700 px-1.5 py-0.5 text-[10px] font-black">Comercial</span>}
                          {l.blindado    && <span className="rounded-full bg-blue-100 text-blue-700 px-1.5 py-0.5 text-[10px] font-black">Blindado</span>}
                          {l.possuiSeguro && l.classeBonus && <span className="rounded-full bg-green-100 text-green-700 px-1.5 py-0.5 text-[10px] font-black">Bônus {l.classeBonus}</span>}
                          {!l.usoComercial && !l.blindado && <span className="text-xs text-gray-400">Particular</span>}
                        </div>
                      </td>
                      <td className="px-4 py-4">
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
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-1.5">
                          <a
                            href={`https://wa.me/55${l.telefone.replace(/\D/g, "")}`}
                            target="_blank" rel="noopener noreferrer"
                            className="rounded-md bg-green-500 p-1.5 text-white hover:opacity-90 transition"
                            title="WhatsApp"
                          >
                            <Icon name="chat" className="text-sm" />
                          </a>
                          <a
                            href={`mailto:${l.email}`}
                            className="rounded-md border border-black/10 p-1.5 text-gray-500 hover:bg-gray-100 transition"
                            title="E-mail"
                          >
                            <Icon name="mail" className="text-sm" />
                          </a>
                          <button
                            onClick={() => updateStatus(l.id, "convertido")}
                            disabled={l.status === "convertido" || updating === l.id}
                            className="rounded-md bg-primary-container p-1.5 text-black hover:opacity-90 disabled:opacity-30 transition"
                            title="Marcar como convertido"
                          >
                            <Icon name="check" className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </ErpLayout>
  );
}
