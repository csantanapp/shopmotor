"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";

interface Lead {
  id: string;
  // Veículo
  tipoVeiculo: string; zeroKm: boolean; placa: string | null;
  ano: string; marca: string; modelo: string; versao: string | null;
  usoComercial: boolean; blindado: boolean; kitGas: boolean; beneficioFiscal: boolean;
  // Uso
  cep: string; condutorJovem: boolean; possuiSeguro: boolean;
  classeBonus: string | null; vencimentoSeguro: string | null;
  // Pessoa
  tipoPessoa: string; nomeSocial: string | null; nome: string; cpfCnpj: string;
  razaoSocial: string | null; nomeFantasia: string | null;
  nascimento: string | null; email: string; telefone: string;
  principalMotorista: boolean;
  // Meta
  status: string; leadTipo: string; storeSlug: string | null;
  vehicleId: string | null; origem: string; createdAt: string;
}

const STATUS_OPTS = ["novo", "contatado", "convertido", "descartado"];
const STATUS_COLORS: Record<string, string> = {
  novo:       "bg-primary-container/20 text-primary",
  contatado:  "bg-blue-500/20 text-blue-400",
  convertido: "bg-green-500/20 text-green-400",
  descartado: "bg-white/5 text-neutral-500",
};
const TIPO_COLORS: Record<string, string> = {
  comum:   "bg-white/5 text-neutral-400",
  lojista: "bg-primary-container/20 text-primary-container",
  premium: "bg-yellow-500/20 text-yellow-400",
};

function bool(v: boolean) { return v ? "Sim" : "Não"; }

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">{label}</p>
      <p className="text-sm text-neutral-300 mt-0.5">{value || "—"}</p>
    </div>
  );
}

function BoolBadge({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${value ? "bg-green-500/20" : "bg-white/5"}`}>
        <Icon name={value ? "check" : "close"} className={`text-[10px] ${value ? "text-green-400" : "text-neutral-600"}`} />
      </div>
      <span className={`text-xs ${value ? "text-neutral-300" : "text-neutral-600"}`}>{label}</span>
    </div>
  );
}

export default function AdminSeguros() {
  const [leads, setLeads]     = useState<Lead[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
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
    !filter ||
    l.nome.toLowerCase().includes(filter.toLowerCase()) ||
    l.email.toLowerCase().includes(filter.toLowerCase()) ||
    l.marca.toLowerCase().includes(filter.toLowerCase()) ||
    l.telefone.includes(filter)
  );

  return (
    <div className="p-8">

      {/* Header */}
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
          <input value={filter} onChange={e => setFilter(e.target.value)}
            placeholder="Nome, e-mail, marca ou telefone..."
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary-container w-72" />
        </div>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {STATUS_OPTS.map(s => {
          const count = leads.filter(l => l.status === s).length;
          return (
            <div key={s} className="bg-[#111414] border border-white/5 rounded-2xl p-5">
              <p className="text-xs font-black text-neutral-600 uppercase tracking-widest capitalize">{s}</p>
              <p className="text-2xl font-black text-white mt-1">{count}</p>
            </div>
          );
        })}
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

              {/* ── Row principal ── */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 bg-primary-container/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name={lead.tipoVeiculo === "moto" ? "two_wheeler" : "directions_car"} className="text-primary-container text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-black text-white text-sm">{lead.nome}</p>
                    {lead.nomeSocial && <span className="text-[10px] text-neutral-500">({lead.nomeSocial})</span>}
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${TIPO_COLORS[lead.leadTipo] ?? ""}`}>
                      {lead.leadTipo}
                    </span>
                    {lead.tipoPessoa === "pj" && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">PJ</span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">{lead.email} · {lead.telefone}</p>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    {lead.marca} {lead.modelo} {lead.ano}
                    {lead.placa ? ` · ${lead.placa}` : ""}
                    {" · CEP "}{lead.cep}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <select value={lead.status} onChange={e => updateStatus(lead.id, e.target.value)}
                    className={`text-xs font-black px-3 py-1.5 rounded-full border-0 outline-none cursor-pointer capitalize ${STATUS_COLORS[lead.status] ?? ""}`}>
                    {STATUS_OPTS.map(s => <option key={s} value={s} className="text-black capitalize">{s}</option>)}
                  </select>
                  <p className="text-[11px] text-neutral-600 whitespace-nowrap">
                    {new Date(lead.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                  </p>
                  <button onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors">
                    <Icon name={expanded === lead.id ? "expand_less" : "expand_more"} className="text-neutral-400 text-base" />
                  </button>
                </div>
              </div>

              {/* ── Detalhes expandidos ── */}
              {expanded === lead.id && (
                <div className="border-t border-white/5 px-5 py-5 space-y-6">

                  {/* Veículo */}
                  <div>
                    <p className="text-[10px] font-black text-primary-container uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Icon name="directions_car" className="text-xs" /> Dados do Veículo
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <InfoRow label="Tipo"    value={lead.tipoVeiculo === "moto" ? "Moto" : "Carro"} />
                      <InfoRow label="Zero km" value={bool(lead.zeroKm)} />
                      <InfoRow label="Placa"   value={lead.placa} />
                      <InfoRow label="Ano"     value={lead.ano} />
                      <InfoRow label="Marca"   value={lead.marca} />
                      <InfoRow label="Modelo"  value={lead.modelo} />
                      <InfoRow label="Versão"  value={lead.versao} />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <BoolBadge label="Uso comercial"   value={lead.usoComercial}    />
                      <BoolBadge label="Blindado"        value={lead.blindado}        />
                      <BoolBadge label="Kit gás"         value={lead.kitGas}          />
                      <BoolBadge label="Benefício fiscal" value={lead.beneficioFiscal} />
                    </div>
                  </div>

                  {/* Uso */}
                  <div>
                    <p className="text-[10px] font-black text-primary-container uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Icon name="location_on" className="text-xs" /> Uso do Veículo
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <InfoRow label="CEP de pernoite"   value={lead.cep} />
                      <InfoRow label="Condutor jovem"    value={bool(lead.condutorJovem)} />
                      <InfoRow label="Possui seguro"     value={bool(lead.possuiSeguro)} />
                      <InfoRow label="Classe de bônus"   value={lead.classeBonus ? `Classe ${lead.classeBonus}` : null} />
                      <InfoRow label="Vencimento seguro" value={lead.vencimentoSeguro
                        ? new Date(lead.vencimentoSeguro + "T00:00:00").toLocaleDateString("pt-BR")
                        : null} />
                    </div>
                  </div>

                  {/* Pessoa */}
                  <div>
                    <p className="text-[10px] font-black text-primary-container uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Icon name="person" className="text-xs" /> Dados do Solicitante
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <InfoRow label="Tipo pessoa"    value={lead.tipoPessoa === "pj" ? "Jurídica" : "Física"} />
                      <InfoRow label="Nome"           value={lead.nome} />
                      <InfoRow label="Nome social"    value={lead.nomeSocial} />
                      <InfoRow label="CPF / CNPJ"     value={lead.cpfCnpj} />
                      {lead.tipoPessoa === "pj" && <>
                        <InfoRow label="Razão Social"   value={lead.razaoSocial} />
                        <InfoRow label="Nome Fantasia"  value={lead.nomeFantasia} />
                      </>}
                      <InfoRow label="Nascimento"     value={lead.nascimento
                        ? new Date(lead.nascimento + "T00:00:00").toLocaleDateString("pt-BR")
                        : null} />
                      <InfoRow label="E-mail"         value={lead.email} />
                      <InfoRow label="Telefone"       value={lead.telefone} />
                      <InfoRow label="Principal motorista" value={bool(lead.principalMotorista)} />
                    </div>
                  </div>

                  {/* Meta */}
                  <div>
                    <p className="text-[10px] font-black text-primary-container uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Icon name="info" className="text-xs" /> Informações do Lead
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <InfoRow label="Origem"     value={lead.origem} />
                      <InfoRow label="Tipo lead"  value={lead.leadTipo} />
                      <InfoRow label="Loja"       value={lead.storeSlug} />
                      <InfoRow label="Veículo ID" value={lead.vehicleId} />
                      <InfoRow label="Criado em"  value={new Date(lead.createdAt).toLocaleString("pt-BR")} />
                    </div>
                  </div>

                  {/* Ações rápidas */}
                  <div className="flex flex-wrap gap-3 pt-2 border-t border-white/5">
                    <a href={`mailto:${lead.email}`}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-bold transition-colors">
                      <Icon name="mail" className="text-sm" /> Enviar e-mail
                    </a>
                    <a href={`https://wa.me/55${lead.telefone.replace(/\D/g, "")}?text=Olá ${lead.nome.split(" ")[0]}! Vi sua solicitação de seguro para o ${lead.marca} ${lead.modelo} no ShopMotor. Posso te ajudar?`}
                      target="_blank"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-bold transition-colors">
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.558 4.14 1.533 5.874L0 24l6.343-1.516A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.213-3.736.893.953-3.625-.235-.374A9.818 9.818 0 1112 21.818z"/></svg>
                      WhatsApp
                    </a>
                  </div>
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
