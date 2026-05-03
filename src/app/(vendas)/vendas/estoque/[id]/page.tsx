"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ErpLayout from "@/components/erp/ErpLayout";
import ErpStatusBadge from "@/components/erp/ErpStatusBadge";
import Icon from "@/components/ui/Icon";
import Link from "next/link";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from "recharts";

/* ── types ── */
interface Photo   { url: string; isCover: boolean; order: number; }
interface Feature { name: string; }
interface Aquisicao {
  proveniencia: string;
  valorPago?: number;
  valorQuitacao?: number;
  valorFinalAquisicao?: number;
  valorNotaFiscal?: number;
  valorMinimoVenda?: number;
  comissaoTipo?: string;
  comissao?: number;
  responsavel?: string;
  clienteFornecedor?: { nome: string; documento: string; telefone?: string; };
}
interface Despesa {
  id: string;
  nome: string;
  data: string;
  valor: number;
  clienteFornecedor?: { id: string; nome: string; } | null;
}
interface ClienteOpt { id: string; nome: string; documento: string; }
interface Vehicle {
  id: string;
  brand: string; model: string; version?: string; bodyType?: string;
  yearFab: number; yearModel: number; km: number;
  fuel: string; transmission: string; color?: string; colorSecondary?: string;
  doors?: number; cylindercc?: number; motoType?: string;
  coolingType?: string; startType?: string; engineType?: string;
  gears?: string; brakeType?: string;
  condition: string; vehicleType: string;
  price: number; acceptTrade: boolean; financing: boolean;
  armored: boolean; auction: boolean; plateEnd?: string;
  description?: string; city?: string; state?: string;
  status: string; views: number;
  fipeCode?: string; fipePrice?: number;
  fipeBrandCode?: string; fipeModelCode?: string; fipeYearCode?: string;
  createdAt: string; updatedAt: string;
  photos: Photo[];
  features: Feature[];
  aquisicao?: Aquisicao;
}

/* ── helpers ── */
const GOLD   = "#ffd709";
const BORDER = "rgba(0,0,0,0.08)";
const MUTED  = "rgba(0,0,0,0.35)";
const TT_STYLE = { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#111" };

function fmt(n?: number | null) {
  if (n == null) return "—";
  return `R$ ${n.toLocaleString("pt-BR")}`;
}
function parseBRL(s: string) { return Number(s.replace(/\D/g, "")) || 0; }
function formatBRL(raw: string | number) {
  const d = String(raw).replace(/\D/g, "");
  return d ? Number(d).toLocaleString("pt-BR") : "";
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between items-center py-2 border-b border-black/5 last:border-0">
      <span className="text-xs text-gray-400 uppercase tracking-wide font-black">{label}</span>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  );
}

function Section({ title, icon, children, action }: { title: string; icon: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Icon name={icon} className="text-gray-400 text-lg" />
          <h2 className="font-black text-gray-900">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

const iCls = "w-full border border-black/10 bg-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none";

/* ── page ── */
export default function EstoqueDetalhe({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const [vehicle, setVehicle]         = useState<Vehicle | null>(null);
  const [loading, setLoading]         = useState(true);
  const [fipeAtual, setFipeAtual]     = useState<number | null>(null);
  const [fipeLoading, setFipeLoading] = useState(false);
  const [photoIdx, setPhotoIdx]       = useState(0);
  const [toast, setToast]             = useState("");

  /* inline edit state */
  const [editPreco, setEditPreco]       = useState(false);
  const [precoVal, setPrecoVal]         = useState("");
  const [editCusto, setEditCusto]       = useState(false);
  const [custoVal, setCustoVal]         = useState("");
  const [savingPreco, setSavingPreco]   = useState(false);
  const [savingCusto, setSavingCusto]   = useState(false);

  /* despesas state */
  const [despesas, setDespesas]         = useState<Despesa[]>([]);
  const [showDespModal, setShowDespModal] = useState(false);
  const [savingDesp, setSavingDesp]     = useState(false);
  const [clientes, setClientes]         = useState<ClienteOpt[]>([]);
  const [despForm, setDespForm]         = useState({ nome: "", data: "", valor: "", clienteFornecedorId: "" });

  const fire = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const loadDespesas = useCallback(async () => {
    const r = await fetch(`/api/vehicles/${id}/despesas`);
    const d = await r.json();
    setDespesas(d.despesas ?? []);
  }, [id]);

  useEffect(() => {
    fetch(`/api/vehicles/${id}`)
      .then(r => r.json())
      .then(async d => {
        const v = d.vehicle;
        if (!v) { router.push("/vendas/estoque"); return; }

        const aqRes = await fetch(`/api/vehicles/${id}/aquisicao`);
        const aqData = await aqRes.json();
        v.aquisicao = aqData.aquisicao;

        const sorted = [...(v.photos ?? [])].sort((a: Photo, b: Photo) => a.order - b.order);
        v.photos = sorted;
        setVehicle(v);
        setPrecoVal(String(v.price));
        setLoading(false);

        if (v.fipeBrandCode && v.fipeModelCode && v.fipeYearCode) {
          setFipeLoading(true);
          const type = v.vehicleType === "MOTO" ? "MOTO" : "CAR";
          fetch(`/api/fipe/brands/${v.fipeBrandCode}/models/${v.fipeModelCode}/years/${v.fipeYearCode}?vehicleType=${type}`)
            .then(r => r.json())
            .then(fipe => {
              if (fipe?.price) {
                // FIPE returns "R$ 72.878,00" — strip R$/spaces/dots, swap comma→dot
                const num = Number(
                  fipe.price.replace(/[^\d,]/g, "").replace(",", ".")
                );
                setFipeAtual(Math.round(num));
              }
              setFipeLoading(false);
            })
            .catch(() => setFipeLoading(false));
        }
      })
      .catch(() => router.push("/vendas/estoque"));

    loadDespesas();

    fetch("/api/perfil/clientes-fornecedores")
      .then(r => r.json())
      .then(d => setClientes(d.items ?? []));
  }, [id, router, loadDespesas]);

  async function savePreco() {
    if (!vehicle) return;
    setSavingPreco(true);
    const valor = parseBRL(precoVal);
    const res = await fetch(`/api/vehicles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: valor }),
    });
    setSavingPreco(false);
    if (res.ok) {
      setVehicle(v => v ? { ...v, price: valor } : v);
      setEditPreco(false);
      fire("Preço atualizado!");
    } else { fire("Erro ao salvar preço."); }
  }

  async function saveCusto() {
    if (!vehicle) return;
    setSavingCusto(true);
    const valor = parseBRL(custoVal);
    const aq = vehicle.aquisicao;
    const body = aq
      ? { proveniencia: aq.proveniencia, valorFinalAquisicao: valor }
      : { proveniencia: "COMPRA", valorFinalAquisicao: valor };
    const res = await fetch(`/api/vehicles/${id}/aquisicao`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSavingCusto(false);
    if (res.ok) {
      setVehicle(v => v ? { ...v, aquisicao: { ...(v.aquisicao ?? { proveniencia: "COMPRA" }), valorFinalAquisicao: valor } } : v);
      setEditCusto(false);
      fire("Custo atualizado!");
    } else { fire("Erro ao salvar custo."); }
  }

  async function saveDespesa() {
    if (!despForm.nome || !despForm.data || !despForm.valor) { fire("Preencha nome, data e valor."); return; }
    setSavingDesp(true);
    const res = await fetch(`/api/vehicles/${id}/despesas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: despForm.nome,
        data: despForm.data,
        valor: parseBRL(despForm.valor),
        clienteFornecedorId: despForm.clienteFornecedorId || null,
      }),
    });
    setSavingDesp(false);
    if (res.ok) {
      fire("Despesa cadastrada!");
      setShowDespModal(false);
      setDespForm({ nome: "", data: "", valor: "", clienteFornecedorId: "" });
      await loadDespesas();
    } else { fire("Erro ao salvar despesa."); }
  }

  async function deleteDespesa(despId: string) {
    await fetch(`/api/vehicles/${id}/despesas/${despId}`, { method: "DELETE" });
    await loadDespesas();
  }

  if (loading) return (
    <ErpLayout title="Ficha do Veículo" subtitle="">
      <div className="flex items-center justify-center py-32">
        <span className="h-8 w-8 rounded-full border-2 border-primary-container/30 border-t-primary-container animate-spin" />
      </div>
    </ErpLayout>
  );

  if (!vehicle) return null;

  const isMoto = vehicle.vehicleType === "MOTO";
  const allPhotos = vehicle.photos;
  const currentPhoto = allPhotos[photoIdx];

  const aq = vehicle.aquisicao;
  const custoAquisicao = aq?.valorFinalAquisicao ?? aq?.valorPago ?? aq?.valorNotaFiscal ?? null;
  const totalDespesas = despesas.reduce((s, d) => s + d.valor, 0);
  const margemPrevista = custoAquisicao != null ? vehicle.price - custoAquisicao - totalDespesas : null;
  const margemPct = custoAquisicao && custoAquisicao > 0
    ? Math.round(((vehicle.price - custoAquisicao - totalDespesas) / custoAquisicao) * 100)
    : null;

  const fipeEntrada = vehicle.fipePrice ?? null;
  const fipeChartData: { mes: string; valor: number }[] = [];
  if (fipeEntrada && fipeAtual) {
    const start = new Date(vehicle.createdAt);
    const now   = new Date();
    const totalMs = now.getTime() - start.getTime();
    const points  = Math.min(Math.max(1, Math.round(totalMs / (30 * 24 * 3600 * 1000))), 8);
    for (let i = 0; i <= points; i++) {
      const d = new Date(start.getTime() + (totalMs / points) * i);
      const val = Math.round(fipeEntrada + ((fipeAtual - fipeEntrada) / points) * i);
      fipeChartData.push({ mes: d.toLocaleString("pt-BR", { month: "short", year: "2-digit" }), valor: val });
    }
  } else if (fipeEntrada) {
    fipeChartData.push({ mes: new Date(vehicle.createdAt).toLocaleString("pt-BR", { month: "short", year: "2-digit" }), valor: fipeEntrada });
    fipeChartData.push({ mes: "Hoje", valor: fipeEntrada });
  }

  const fipeDiff    = fipeEntrada && fipeAtual ? fipeAtual - fipeEntrada : null;
  const fipeDiffPct = fipeEntrada && fipeDiff != null ? Math.round((fipeDiff / fipeEntrada) * 100) : null;

  return (
    <ErpLayout
      title={`${vehicle.brand} ${vehicle.model}${vehicle.version ? ` ${vehicle.version}` : ""}`}
      subtitle={`${vehicle.yearFab} · ${vehicle.km.toLocaleString("pt-BR")} km`}
    >
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-2xl">{toast}</div>
      )}

      {/* Despesa modal */}
      {showDespModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowDespModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-black/10">
              <p className="font-black text-gray-900">Cadastrar Despesa</p>
              <button onClick={() => setShowDespModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <Icon name="close" className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">Nome da despesa *</label>
                <input type="text" value={despForm.nome}
                  onChange={e => setDespForm(f => ({ ...f, nome: e.target.value }))}
                  className={iCls} placeholder="Ex: IPVA, revisão, funilaria..." />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">Data *</label>
                <input type="date" value={despForm.data}
                  onChange={e => setDespForm(f => ({ ...f, data: e.target.value }))}
                  className={iCls} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">Fornecedor</label>
                <select value={despForm.clienteFornecedorId}
                  onChange={e => setDespForm(f => ({ ...f, clienteFornecedorId: e.target.value }))}
                  className={iCls}>
                  <option value="">— Nenhum —</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nome} ({c.documento})</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">Valor *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
                  <input type="text" inputMode="numeric" value={formatBRL(despForm.valor)}
                    onChange={e => setDespForm(f => ({ ...f, valor: e.target.value.replace(/\D/g, "") }))}
                    className={`${iCls} pl-9`} placeholder="0,00" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-black/10">
              <button onClick={saveDespesa} disabled={savingDesp}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-container text-black py-3 rounded-xl font-black text-sm hover:opacity-90 transition disabled:opacity-50">
                {savingDesp && <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
                Salvar
              </button>
              <button onClick={() => setShowDespModal(false)}
                className="px-6 py-3 rounded-xl border border-black/10 text-sm text-gray-500 hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back + actions */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.push("/vendas/estoque")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition">
          <Icon name="arrow_back" className="text-base" /> Voltar ao Estoque
        </button>
        <div className="flex gap-2">
          <ErpStatusBadge status={vehicle.status.toLowerCase()} />
          <Link href={`/vendas/veiculos/editar/${id}`}
            className="flex items-center gap-1.5 rounded-xl bg-primary-container text-black px-4 py-2 text-sm font-black hover:opacity-90 transition">
            <Icon name="edit" className="text-sm" /> Editar
          </Link>
          <a href={`/vendas/estoque/${id}/print`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-black text-gray-600 hover:bg-gray-50 transition">
            <Icon name="print" className="text-sm" /> Imprimir Ficha
          </a>
          {vehicle.city && (
            <a href={`/carro/${id}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-black/10 px-4 py-2 text-sm font-black text-gray-600 hover:bg-gray-50 transition">
              <Icon name="visibility" className="text-sm" /> Ver anúncio
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Gallery */}
          {allPhotos.length > 0 && (
            <div className="rounded-xl border border-black/10 bg-white overflow-hidden shadow-sm">
              <div className="relative aspect-video bg-gray-100">
                <img src={currentPhoto?.url} alt="" className="w-full h-full object-cover" />
                {allPhotos.length > 1 && (
                  <>
                    <button onClick={() => setPhotoIdx(i => (i - 1 + allPhotos.length) % allPhotos.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition">
                      <Icon name="chevron_left" className="text-white text-xl" />
                    </button>
                    <button onClick={() => setPhotoIdx(i => (i + 1) % allPhotos.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition">
                      <Icon name="chevron_right" className="text-white text-xl" />
                    </button>
                    <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-black px-2 py-1 rounded-full">
                      {photoIdx + 1} / {allPhotos.length}
                    </div>
                  </>
                )}
              </div>
              {allPhotos.length > 1 && (
                <div className="flex gap-1.5 p-3 overflow-x-auto">
                  {allPhotos.map((p, i) => (
                    <button key={i} onClick={() => setPhotoIdx(i)}
                      className={`shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition ${i === photoIdx ? "border-primary-container" : "border-transparent"}`}>
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Identificação */}
          <Section title="Identificação" icon="directions_car">
            <div className="space-y-0">
              <InfoRow label="Marca" value={vehicle.brand} />
              <InfoRow label="Modelo" value={vehicle.model} />
              <InfoRow label="Versão" value={vehicle.version} />
              <InfoRow label="Ano fabricação" value={vehicle.yearFab} />
              <InfoRow label="Ano modelo" value={vehicle.yearModel} />
              <InfoRow label="Condição" value={vehicle.condition === "NEW" ? "Novo" : "Usado"} />
              {!isMoto && <InfoRow label="Carroceria" value={vehicle.bodyType} />}
              {!isMoto && <InfoRow label="Final da placa" value={vehicle.plateEnd} />}
              <InfoRow label="Localização" value={vehicle.city && vehicle.state ? `${vehicle.city} / ${vehicle.state}` : (vehicle.city ?? vehicle.state)} />
            </div>
          </Section>

          {/* Especificações */}
          <Section title="Especificações técnicas" icon="settings">
            <div className="space-y-0">
              <InfoRow label="Quilometragem" value={`${vehicle.km.toLocaleString("pt-BR")} km`} />
              <InfoRow label="Combustível" value={vehicle.fuel} />
              <InfoRow label="Câmbio" value={vehicle.transmission} />
              <InfoRow label="Cor principal" value={vehicle.color} />
              <InfoRow label="Cor secundária" value={vehicle.colorSecondary} />
              {!isMoto && <InfoRow label="Portas" value={vehicle.doors ? `${vehicle.doors} portas` : null} />}
              {isMoto && <InfoRow label="Cilindrada" value={vehicle.cylindercc ? `${vehicle.cylindercc} cc` : null} />}
              {isMoto && <InfoRow label="Tipo/Estilo" value={vehicle.motoType} />}
              {isMoto && <InfoRow label="Tipo de motor" value={vehicle.engineType} />}
              {isMoto && <InfoRow label="Marchas" value={vehicle.gears} />}
              {isMoto && <InfoRow label="Refrigeração" value={vehicle.coolingType} />}
              {isMoto && <InfoRow label="Partida" value={vehicle.startType} />}
              {isMoto && <InfoRow label="Freios" value={vehicle.brakeType} />}
              <InfoRow label="Blindado" value={vehicle.armored ? "Sim" : null} />
              <InfoRow label="Leilão" value={vehicle.auction ? "Sim" : null} />
            </div>
          </Section>

          {/* Opcionais */}
          {vehicle.features.length > 0 && (
            <Section title="Opcionais e características" icon="star">
              <div className="flex flex-wrap gap-2">
                {vehicle.features.map(f => (
                  <span key={f.name} className="rounded-full border border-black/10 bg-gray-50 px-3 py-1 text-xs font-bold text-gray-700">
                    {f.name}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Descrição */}
          {vehicle.description && (
            <Section title="Descrição" icon="description">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{vehicle.description}</p>
            </Section>
          )}

          {/* Aquisição */}
          {aq && (
            <Section title="Dados de aquisição" icon="receipt_long">
              <div className="space-y-0">
                <InfoRow label="Proveniência" value={aq.proveniencia.charAt(0) + aq.proveniencia.slice(1).toLowerCase()} />
                <InfoRow label="Responsável" value={aq.responsavel} />
                {aq.clienteFornecedor && <InfoRow label="Cliente / Fornecedor" value={`${aq.clienteFornecedor.nome} (${aq.clienteFornecedor.documento})`} />}
                {aq.valorPago != null && <InfoRow label="Valor pago" value={fmt(aq.valorPago)} />}
                {aq.valorQuitacao != null && <InfoRow label="Valor de quitação" value={fmt(aq.valorQuitacao)} />}
                {aq.valorFinalAquisicao != null && <InfoRow label="Valor final de aquisição" value={fmt(aq.valorFinalAquisicao)} />}
                {aq.valorNotaFiscal != null && <InfoRow label="Valor na Nota Fiscal" value={fmt(aq.valorNotaFiscal)} />}
                {aq.valorMinimoVenda != null && <InfoRow label="Valor mínimo de venda" value={fmt(aq.valorMinimoVenda)} />}
                {aq.comissao != null && <InfoRow label="Comissão" value={aq.comissaoTipo === "PERCENT" ? `${aq.comissao}%` : fmt(aq.comissao)} />}
              </div>
            </Section>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Valores */}
          <Section title="Valores" icon="payments">
            <div className="space-y-3">

              {/* Valor de venda */}
              <div className="rounded-xl bg-primary-container/10 border border-primary-container/30 p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-black uppercase tracking-wide text-yellow-700">Valor de venda</p>
                  <button onClick={() => { setEditPreco(e => !e); setPrecoVal(String(vehicle.price)); }}
                    className="text-yellow-600 hover:text-yellow-800 transition">
                    <Icon name={editPreco ? "close" : "edit"} className="text-sm" />
                  </button>
                </div>
                {editPreco ? (
                  <div className="flex gap-2 mt-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">R$</span>
                      <input type="text" inputMode="numeric" autoFocus
                        value={formatBRL(precoVal)}
                        onChange={e => setPrecoVal(e.target.value.replace(/\D/g, ""))}
                        className="w-full border border-primary-container bg-white rounded-lg pl-7 pr-2 py-2 text-sm font-black focus:outline-none" />
                    </div>
                    <button onClick={savePreco} disabled={savingPreco}
                      className="flex items-center gap-1 bg-primary-container text-black px-3 py-2 rounded-lg text-xs font-black hover:opacity-90 transition disabled:opacity-50">
                      {savingPreco ? <span className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <Icon name="check" className="text-xs" />}
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-black text-gray-900">{fmt(vehicle.price)}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {vehicle.acceptTrade && <span className="text-[10px] font-black rounded-full bg-blue-100 text-blue-700 px-2 py-0.5">Aceita troca</span>}
                      {vehicle.financing   && <span className="text-[10px] font-black rounded-full bg-green-100 text-green-700 px-2 py-0.5">Financia</span>}
                    </div>
                  </>
                )}
              </div>

              {/* Custo de aquisição */}
              <div className="rounded-xl border border-black/10 bg-gray-50 p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-black uppercase tracking-wide text-gray-400">Custo de aquisição</p>
                  <button onClick={() => { setEditCusto(e => !e); setCustoVal(String(custoAquisicao ?? 0)); }}
                    className="text-gray-400 hover:text-gray-700 transition">
                    <Icon name={editCusto ? "close" : "edit"} className="text-sm" />
                  </button>
                </div>
                {editCusto ? (
                  <div className="flex gap-2 mt-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">R$</span>
                      <input type="text" inputMode="numeric" autoFocus
                        value={formatBRL(custoVal)}
                        onChange={e => setCustoVal(e.target.value.replace(/\D/g, ""))}
                        className="w-full border border-black/20 bg-white rounded-lg pl-7 pr-2 py-2 text-sm font-black focus:outline-none focus:border-primary-container" />
                    </div>
                    <button onClick={saveCusto} disabled={savingCusto}
                      className="flex items-center gap-1 bg-primary-container text-black px-3 py-2 rounded-lg text-xs font-black hover:opacity-90 transition disabled:opacity-50">
                      {savingCusto ? <span className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <Icon name="check" className="text-xs" />}
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-xl font-black text-gray-900">{fmt(custoAquisicao)}</p>
                    {aq?.proveniencia && (
                      <p className="text-[10px] text-gray-400 mt-1 capitalize">{aq.proveniencia.toLowerCase()}</p>
                    )}
                  </>
                )}
              </div>

              {/* Despesas */}
              <div className="rounded-xl border border-black/10 bg-gray-50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-black uppercase tracking-wide text-gray-400">Despesas</p>
                  <button onClick={() => setShowDespModal(true)}
                    className="flex items-center gap-1 text-xs font-black text-gray-500 hover:text-gray-900 border border-black/10 rounded-lg px-2 py-1 hover:bg-white transition">
                    <Icon name="add" className="text-xs" /> Adicionar
                  </button>
                </div>
                {despesas.length === 0 ? (
                  <p className="text-sm text-gray-400">Nenhuma despesa cadastrada.</p>
                ) : (
                  <div className="space-y-1.5">
                    {despesas.map(d => (
                      <div key={d.id} className="flex items-center justify-between gap-2 bg-white rounded-lg border border-black/5 px-3 py-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-gray-800 truncate">{d.nome}</p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(d.data).toLocaleDateString("pt-BR")}
                            {d.clienteFornecedor && ` · ${d.clienteFornecedor.nome}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-black text-gray-900">{fmt(d.valor)}</span>
                          <button onClick={() => deleteDespesa(d.id)} className="text-gray-300 hover:text-red-500 transition">
                            <Icon name="delete" className="text-xs" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-1 border-t border-black/5">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-wide">Total despesas</span>
                      <span className="text-sm font-black text-gray-900">{fmt(totalDespesas)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Margem prevista */}
              <div className={`rounded-xl border p-4 ${margemPrevista != null && margemPrevista > 0 ? "border-green-200 bg-green-50" : margemPrevista != null ? "border-red-200 bg-red-50" : "border-black/10 bg-gray-50"}`}>
                <p className={`text-xs font-black uppercase tracking-wide ${margemPrevista != null && margemPrevista > 0 ? "text-green-700" : margemPrevista != null ? "text-red-700" : "text-gray-400"}`}>
                  Margem prevista
                </p>
                <p className={`text-xl font-black mt-1 ${margemPrevista != null && margemPrevista > 0 ? "text-green-700" : margemPrevista != null ? "text-red-700" : "text-gray-400"}`}>
                  {margemPrevista != null ? fmt(margemPrevista) : "—"}
                </p>
                {margemPct != null && (
                  <p className={`text-xs font-black mt-0.5 ${margemPct > 0 ? "text-green-600" : "text-red-600"}`}>
                    {margemPct > 0 ? "+" : ""}{margemPct}% sobre o custo
                  </p>
                )}
              </div>
            </div>
          </Section>

          {/* Visibilidade */}
          <Section title="Visibilidade" icon="bar_chart">
            <div className="space-y-0">
              <InfoRow label="Visualizações" value={vehicle.views.toLocaleString("pt-BR")} />
              <InfoRow label="Cadastrado em" value={new Date(vehicle.createdAt).toLocaleDateString("pt-BR")} />
              <InfoRow label="Atualizado em" value={new Date(vehicle.updatedAt).toLocaleDateString("pt-BR")} />
            </div>
          </Section>

          {/* FIPE */}
          <Section title="Tabela FIPE" icon="trending_up">
            {!vehicle.fipeBrandCode ? (
              <p className="text-sm text-gray-400">Veículo não vinculado à tabela FIPE.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-black/10 bg-gray-50 p-3">
                    <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">Valor na entrada</p>
                    <p className="text-base font-black text-gray-900 mt-1">
                      {fipeEntrada ? fmt(fipeEntrada) : "—"}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(vehicle.createdAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="rounded-xl border border-black/10 bg-gray-50 p-3">
                    <p className="text-[10px] font-black uppercase tracking-wide text-gray-400">Valor atual FIPE</p>
                    {fipeLoading ? (
                      <span className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                        <span className="w-3 h-3 rounded-full border border-gray-300 border-t-gray-600 animate-spin" /> carregando
                      </span>
                    ) : (
                      <>
                        <p className="text-base font-black text-gray-900 mt-1">{fipeAtual ? fmt(fipeAtual) : "—"}</p>
                        {fipeDiff != null && (
                          <p className={`text-[10px] font-black mt-0.5 ${fipeDiff >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {fipeDiff >= 0 ? "+" : ""}{fmt(fipeDiff)} ({fipeDiffPct}%)
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {fipeChartData.length > 1 && (
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-gray-400 mb-2">Evolução FIPE</p>
                    <div className="h-40">
                      <ResponsiveContainer>
                        <LineChart data={fipeChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                          <XAxis dataKey="mes" stroke={MUTED} fontSize={10} />
                          <YAxis stroke={MUTED} fontSize={10} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                          <Tooltip contentStyle={TT_STYLE} formatter={(v: unknown) => [fmt(v as number), "FIPE"]} />
                          {fipeEntrada && (
                            <ReferenceLine y={fipeEntrada} stroke="#9ca3af" strokeDasharray="4 2"
                              label={{ value: "Entrada", position: "insideTopLeft", fontSize: 9, fill: "#9ca3af" }} />
                          )}
                          <Line type="monotone" dataKey="valor" stroke={GOLD} strokeWidth={2.5}
                            dot={{ fill: GOLD, r: 3 }} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {vehicle.fipeCode && (
                  <p className="text-[10px] text-gray-400">Código FIPE: {vehicle.fipeCode}</p>
                )}
              </div>
            )}
          </Section>
        </div>
      </div>
    </ErpLayout>
  );
}
