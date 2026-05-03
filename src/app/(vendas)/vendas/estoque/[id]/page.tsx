"use client";

import { useState, useEffect } from "react";
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
const GOLD = "#ffd709";
const BORDER = "rgba(0,0,0,0.08)";
const MUTED = "rgba(0,0,0,0.35)";
const TT_STYLE = { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, color: "#111" };

function fmt(n?: number | null) {
  if (n == null) return "—";
  return `R$ ${n.toLocaleString("pt-BR")}`;
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

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 border-b border-black/5 pb-4 mb-4">
        <Icon name={icon} className="text-gray-400 text-lg" />
        <h2 className="font-black text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ── page ── */
export default function EstoqueDetalhe({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const [vehicle, setVehicle]     = useState<Vehicle | null>(null);
  const [loading, setLoading]     = useState(true);
  const [fipeAtual, setFipeAtual] = useState<number | null>(null);
  const [fipeLoading, setFipeLoading] = useState(false);
  const [photoIdx, setPhotoIdx]   = useState(0);

  useEffect(() => {
    fetch(`/api/vehicles/${id}`)
      .then(r => r.json())
      .then(async d => {
        const v = d.vehicle;
        if (!v) { router.push("/vendas/estoque"); return; }

        // load aquisicao
        const aqRes = await fetch(`/api/vehicles/${id}/aquisicao`);
        const aqData = await aqRes.json();
        v.aquisicao = aqData.aquisicao;

        const sorted = [...(v.photos ?? [])].sort((a: Photo, b: Photo) => a.order - b.order);
        v.photos = sorted;
        setVehicle(v);
        setLoading(false);

        // fetch current FIPE price
        if (v.fipeBrandCode && v.fipeModelCode && v.fipeYearCode) {
          setFipeLoading(true);
          const type = v.vehicleType === "MOTO" ? "MOTO" : "CAR";
          fetch(`/api/fipe/brands/${v.fipeBrandCode}/models/${v.fipeModelCode}/years/${v.fipeYearCode}?vehicleType=${type}`)
            .then(r => r.json())
            .then(fipe => {
              if (fipe?.price) {
                const num = Number(fipe.price.replace(/[^\d,]/g, "").replace(",", ".")) * 100;
                setFipeAtual(Math.round(num));
              }
              setFipeLoading(false);
            })
            .catch(() => setFipeLoading(false));
        }
      })
      .catch(() => router.push("/vendas/estoque"));
  }, [id, router]);

  if (loading) return (
    <ErpLayout title="Ficha do Veículo" subtitle="">
      <div className="flex items-center justify-center py-32">
        <span className="h-8 w-8 rounded-full border-2 border-primary-container/30 border-t-primary-container animate-spin" />
      </div>
    </ErpLayout>
  );

  if (!vehicle) return null;

  const isMoto = vehicle.vehicleType === "MOTO";
  const coverPhotos = vehicle.photos.filter(p => p.isCover);
  const allPhotos = vehicle.photos;
  const currentPhoto = allPhotos[photoIdx];

  /* custo de aquisição */
  const aq = vehicle.aquisicao;
  const custoAquisicao = aq?.valorFinalAquisicao ?? aq?.valorPago ?? aq?.valorNotaFiscal ?? null;
  const margemPrevista = custoAquisicao != null ? vehicle.price - custoAquisicao : null;
  const margemPct = custoAquisicao && custoAquisicao > 0 ? Math.round(((vehicle.price - custoAquisicao) / custoAquisicao) * 100) : null;

  /* FIPE chart data */
  const fipeEntrada = vehicle.fipePrice ?? null;
  const fipeChartData: { mes: string; valor: number }[] = [];
  if (fipeEntrada && fipeAtual) {
    const start = new Date(vehicle.createdAt);
    const now   = new Date();
    const totalMs = now.getTime() - start.getTime();
    const months  = Math.max(1, Math.round(totalMs / (30 * 24 * 3600 * 1000)));
    const points  = Math.min(months + 1, 8);
    for (let i = 0; i <= points; i++) {
      const d = new Date(start.getTime() + (totalMs / points) * i);
      const val = Math.round(fipeEntrada + ((fipeAtual - fipeEntrada) / points) * i);
      fipeChartData.push({ mes: d.toLocaleString("pt-BR", { month: "short", year: "2-digit" }), valor: val });
    }
  } else if (fipeEntrada) {
    const d = new Date(vehicle.createdAt);
    fipeChartData.push({ mes: d.toLocaleString("pt-BR", { month: "short", year: "2-digit" }), valor: fipeEntrada });
    fipeChartData.push({ mes: "Hoje", valor: fipeEntrada });
  }

  const fipeDiff = fipeEntrada && fipeAtual ? fipeAtual - fipeEntrada : null;
  const fipeDiffPct = fipeEntrada && fipeDiff != null ? Math.round((fipeDiff / fipeEntrada) * 100) : null;

  return (
    <ErpLayout
      title={`${vehicle.brand} ${vehicle.model}${vehicle.version ? ` ${vehicle.version}` : ""}`}
      subtitle={`${vehicle.yearFab} · ${vehicle.km.toLocaleString("pt-BR")} km`}
    >
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
                {(aq.valorPago != null) && <InfoRow label="Valor pago" value={fmt(aq.valorPago)} />}
                {(aq.valorQuitacao != null) && <InfoRow label="Valor de quitação" value={fmt(aq.valorQuitacao)} />}
                {(aq.valorFinalAquisicao != null) && <InfoRow label="Valor final de aquisição" value={fmt(aq.valorFinalAquisicao)} />}
                {(aq.valorNotaFiscal != null) && <InfoRow label="Valor na Nota Fiscal" value={fmt(aq.valorNotaFiscal)} />}
                {(aq.valorMinimoVenda != null) && <InfoRow label="Valor mínimo de venda" value={fmt(aq.valorMinimoVenda)} />}
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
              <div className="rounded-xl bg-primary-container/10 border border-primary-container/30 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-yellow-700">Valor de venda</p>
                <p className="text-2xl font-black text-gray-900 mt-1">{fmt(vehicle.price)}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {vehicle.acceptTrade && <span className="text-[10px] font-black rounded-full bg-blue-100 text-blue-700 px-2 py-0.5">Aceita troca</span>}
                  {vehicle.financing   && <span className="text-[10px] font-black rounded-full bg-green-100 text-green-700 px-2 py-0.5">Financia</span>}
                </div>
              </div>

              <div className="rounded-xl border border-black/10 bg-gray-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-gray-400">Custo de aquisição</p>
                <p className="text-xl font-black text-gray-900 mt-1">{fmt(custoAquisicao)}</p>
                {aq?.proveniencia && (
                  <p className="text-[10px] text-gray-400 mt-1 capitalize">{aq.proveniencia.toLowerCase()}</p>
                )}
              </div>

              <div className="rounded-xl border border-black/10 bg-gray-50 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-gray-400">Despesas</p>
                <p className="text-xl font-black text-gray-400 mt-1">—</p>
                <p className="text-[10px] text-gray-400 mt-0.5">A definir em breve</p>
              </div>

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

                {/* FIPE chart */}
                {fipeChartData.length > 1 && (
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-gray-400 mb-2">Evolução FIPE</p>
                    <div className="h-40">
                      <ResponsiveContainer>
                        <LineChart data={fipeChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                          <XAxis dataKey="mes" stroke={MUTED} fontSize={10} />
                          <YAxis stroke={MUTED} fontSize={10} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                          <Tooltip
                            contentStyle={TT_STYLE}
                            formatter={(v: unknown) => [fmt(v as number), "FIPE"]}
                          />
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
