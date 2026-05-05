"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ErpLayout from "@/components/erp/ErpLayout";
import Icon from "@/components/ui/Icon";

const STEPS = ["Dados básicos", "Especificações", "Preço", "Fotos"];

const fuelOptions         = ["Flex","Gasolina","Etanol","Diesel","Elétrico","Híbrido","GNV"];
const motoFuelOptions     = ["Gasolina","Etanol","Flex","Elétrico"];
const transmissionOptions = ["Automático","Manual","CVT","Automatizado"];
const bodyOptions         = ["Hatch","Sedã","SUV/Crossover","Picape","Minivan","Esportivo","Conversível","Cupê","Van/Utilitário/Furgão","Buggy"];
const plateEndOptions     = ["1 e 2","3 e 4","5 e 6","7 e 8","9 e 0"];
const colorOptions        = ["Branco","Prata","Preto","Cinza","Vermelho","Azul","Verde","Amarelo","Laranja","Marrom","Bege","Dourado","Vinho","Outro"];
const motoStyleOptions    = ["Ciclomotor","Custom","Esportiva","Naked","Off Road","Quadriciclo","Scooter","Street","Supermotard","Touring","Trail","Trial","Triciclo","Utilitária"];
const coolingOptions      = ["Ar","Líquida"];
const startTypeOptions    = ["Elétrica","Pedal","Pedal + Elétrica"];
const engineTypeOptions   = ["2 tempos","4 tempos","Elétrico de corrente contínua"];
const gearsOptions        = ["2","3","4","5","6","7","8","Automático"];
const brakeTypeOptions    = ["Disco/Disco","Disco/Tambor","Tambor/Disco","Tambor/Tambor"];
const motoNeedOptions     = ["Esportiva","Estrada","Fora-de-estrada","Lazer","Urbano"];

const FEATURES_CARACTERISTICAS = ["Alienado","Garantia de fábrica","IPVA Pago","Licenciado","Todas revisões feitas pela concessionária","Único dono","Passagem por Leilão"];
const FEATURES_EXTRAS          = ["Ar condicionado","Bancos em couro","Direção hidráulica/elétrica","Piloto automático","Retrovisores elétricos","Travas elétricas","Vidros elétricos"];
const FEATURES_SEGURANCA       = ["Airbag","Controle de tração","Freio ABS","Blindado"];
const FEATURES_TECH            = ["Carplay","Sensor de estacionamento"];
const FEATURES_OUTROS          = ["Faróis de LED/Xenon","Rodas liga leve","Teto solar","Tração 4x4"];
const FEATURES_MOTO            = ["Aceito troca","Alienado","Garantia de fábrica","IPVA Pago","Licenciado","Revisões feitas pela concessionária","Único dono","Passagem por Leilão"];

interface FipeItem { code: string; name: string; }

function toTitleCase(s: string) {
  return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function fuelFromFipe(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("gasolina")) return "Gasolina";
  if (n.includes("álcool") || n.includes("alcool") || n.includes("etanol")) return "Etanol";
  if (n.includes("diesel")) return "Diesel";
  if (n.includes("elétrico") || n.includes("eletrico")) return "Elétrico";
  if (n.includes("flex")) return "Flex";
  if (n.includes("gnv")) return "GNV";
  return "";
}

const iCls  = "w-full border border-black/10 bg-gray-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none disabled:opacity-50";
const lblCls = "block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-1.5";

function FInput({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className={lblCls}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} className={iCls} />
    </div>
  );
}

function FSelect({ label, value, onChange, children, disabled }: {
  label: string; value: string; onChange: (v: string) => void;
  children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <div>
      <label className={lblCls}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        disabled={disabled} className={iCls}>
        {children}
      </select>
    </div>
  );
}

function FeatureBlock({ title, features, selected, onToggle }: {
  title: string; features: string[]; selected: string[]; onToggle: (f: string) => void;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-5">
      <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">{title}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {features.map(f => (
          <label key={f} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input type="checkbox" checked={selected.includes(f)} onChange={() => onToggle(f)}
              className="w-4 h-4 accent-yellow-500 shrink-0" />
            {f}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function NovoVeiculoPage() {
  const router = useRouter();
  const [vehicleType, setVehicleType] = useState<"CAR" | "MOTO" | null>(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [vehicleId, setVehicleId] = useState<string | null>(null);

  const [fipeBrands, setFipeBrands] = useState<FipeItem[]>([]);
  const [fipeModels, setFipeModels] = useState<FipeItem[]>([]);
  const [fipeYears, setFipeYears]   = useState<FipeItem[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingYears, setLoadingYears]   = useState(false);

  const [form, setForm] = useState({
    brand: "", model: "", version: "", bodyType: "",
    condition: "Usado",
    yearFab: "", yearModel: "", km: "",
    fuel: "", transmission: "", color: "", doors: "",
    cylindercc: "", motoType: "",
    coolingType: "", startType: "", engineType: "", gears: "", brakeType: "",
    colorSecondary: "", motoNeed: "",
    price: "", acceptTrade: false, financing: false,
    description: "",
    fipeBrandCode: "", fipeModelCode: "", fipeYearCode: "",
    plateEnd: "",
    features: [] as string[],
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  useEffect(() => {
    if (!vehicleType) return;
    setLoadingBrands(true);
    fetch(`/api/fipe/brands?vehicleType=${vehicleType}`)
      .then(r => r.json())
      .then(d => setFipeBrands(Array.isArray(d) ? d : []))
      .finally(() => setLoadingBrands(false));
  }, [vehicleType]);

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function toggleFeature(feat: string) {
    setForm(f => ({
      ...f,
      features: f.features.includes(feat)
        ? f.features.filter(x => x !== feat)
        : [...f.features, feat],
    }));
  }

  async function onBrandChange(code: string, name: string) {
    setForm(f => ({ ...f, fipeBrandCode: code, brand: toTitleCase(name), fipeModelCode: "", model: "", fipeYearCode: "", yearFab: "", yearModel: "", fuel: "" }));
    setFipeModels([]); setFipeYears([]);
    if (!code) return;
    setLoadingModels(true);
    const res  = await fetch(`/api/fipe/brands/${code}/models?vehicleType=${vehicleType}`);
    const data = await res.json();
    const models = Array.isArray(data) ? data : (data.models ?? []);
    setFipeModels(models.map((m: FipeItem) => ({ ...m, code: String(m.code) })));
    setLoadingModels(false);
  }

  async function onModelChange(code: string, name: string) {
    setForm(f => ({ ...f, fipeModelCode: code, model: toTitleCase(name), fipeYearCode: "", yearFab: "", yearModel: "", fuel: "" }));
    setFipeYears([]);
    if (!code || !form.fipeBrandCode) return;
    setLoadingYears(true);
    const res  = await fetch(`/api/fipe/brands/${form.fipeBrandCode}/models/${code}/years?vehicleType=${vehicleType}`);
    const data = await res.json();
    setFipeYears((Array.isArray(data) ? data : []).map((y: FipeItem) => ({ ...y, code: String(y.code) })));
    setLoadingYears(false);
  }

  function onYearChange(code: string, name: string) {
    const year = parseInt(name);
    setForm(f => ({ ...f, fipeYearCode: code, yearFab: String(year), yearModel: String(year), fuel: fuelFromFipe(name) }));
  }

  async function submitVehicle() {
    setError(""); setLoading(true);
    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        vehicleType,
        yearFab:   Number(form.yearFab),
        yearModel: Number(form.yearFab),
        km:    Number(form.km),
        price: Number(String(form.price).replace(/\D/g, "")),
        doors: form.doors ? Number(form.doors) : null,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Erro ao criar veículo."); return false; }
    setVehicleId(data.vehicle.id);
    return true;
  }

  async function uploadPhotos(id: string) {
    if (photos.length === 0) return;
    setUploadingPhotos(true);
    const fd = new FormData();
    photos.forEach(f => fd.append("photos", f));
    await fetch(`/api/vehicles/${id}/photos`, { method: "POST", body: fd });
    setUploadingPhotos(false);
  }

  async function handleNext() {
    setError("");
    if (step === 0) {
      if (!form.fipeBrandCode || !form.fipeModelCode || !form.fipeYearCode || !form.km) {
        setError("Selecione a marca, modelo, ano e informe a quilometragem."); return;
      }
    }
    if (step === 2) {
      if (!await submitVehicle()) return;
    }
    if (step === 3) {
      if (photos.length < 3) { setError("Adicione pelo menos 3 fotos."); return; }
      const id = vehicleId!;
      await uploadPhotos(id);
      router.push("/vendas/veiculos");
      return;
    }
    setStep(s => s + 1);
  }

  const isMoto = vehicleType === "MOTO";

  // ── Seleção de tipo ──
  if (!vehicleType) {
    return (
      <ErpLayout title="Novo Veículo" subtitle="Escolha o tipo de veículo para cadastrar">
        <div className="max-w-lg mx-auto pt-6">
          <div className="grid grid-cols-2 gap-5">
            {[
              { type: "CAR" as const, icon: "directions_car", label: "Carro", sub: "Carros, SUVs, Pickups e mais" },
              { type: "MOTO" as const, icon: "two_wheeler", label: "Moto", sub: "Motos, scooters e esportivas" },
            ].map(opt => (
              <button key={opt.type} onClick={() => setVehicleType(opt.type)}
                className="group flex flex-col items-center justify-center gap-5 rounded-2xl border-2 border-black/10 bg-white p-10 hover:border-primary-container hover:bg-primary-container/5 transition-all shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 group-hover:bg-primary-container/20 flex items-center justify-center transition-colors">
                  <Icon name={opt.icon} className="text-4xl text-gray-700" />
                </div>
                <div className="text-center">
                  <p className="font-black text-gray-900 text-lg uppercase tracking-tight">{opt.label}</p>
                  <p className="text-xs text-gray-400 mt-1">{opt.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </ErpLayout>
    );
  }

  return (
    <ErpLayout
      title={`Cadastrar ${isMoto ? "Moto" : "Carro"}`}
      subtitle="Preencha os dados do veículo para publicar o anúncio"
      action={
        <button onClick={() => { setVehicleType(null); setStep(0); }}
          className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-black text-gray-600 hover:bg-gray-50 transition">
          <Icon name="arrow_back" className="text-base" /> Voltar
        </button>
      }
    >
      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-2 ${i <= step ? "text-gray-900" : "text-gray-300"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0
                ${i < step ? "bg-green-500 text-white" : i === step ? "bg-primary-container text-black" : "bg-gray-100 text-gray-400"}`}>
                {i < step ? <Icon name="check" className="text-sm" /> : i + 1}
              </div>
              <span className="text-xs font-bold hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px ${i < step ? "bg-green-400" : "bg-black/10"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 font-medium mb-6">
          <Icon name="error" className="text-base shrink-0" /> {error}
        </div>
      )}

      {/* ── Step 0: Dados básicos ── */}
      {step === 0 && (
        <div className="space-y-5">
          <div className="rounded-xl border border-black/10 bg-white p-6 space-y-5">
            <p className="text-xs font-black uppercase tracking-wider text-gray-400 border-b border-black/5 pb-3">Identificação</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Marca FIPE */}
              <div>
                <label className={lblCls}>
                  Marca * {loadingBrands && <span className="normal-case font-normal text-gray-300">(carregando...)</span>}
                </label>
                <select value={form.fipeBrandCode} disabled={loadingBrands} className={iCls}
                  onChange={e => { const opt = fipeBrands.find(b => b.code === e.target.value); onBrandChange(e.target.value, opt?.name ?? ""); }}>
                  <option value="">Selecione a marca</option>
                  {fipeBrands.map(b => <option key={b.code} value={b.code}>{toTitleCase(b.name)}</option>)}
                </select>
              </div>

              {/* Modelo FIPE */}
              <div>
                <label className={lblCls}>
                  Modelo * {loadingModels && <span className="normal-case font-normal text-gray-300">(carregando...)</span>}
                </label>
                <select value={form.fipeModelCode} disabled={!form.fipeBrandCode || loadingModels} className={iCls}
                  onChange={e => { const opt = fipeModels.find(m => m.code === e.target.value); onModelChange(e.target.value, opt?.name ?? ""); }}>
                  <option value="">Selecione o modelo</option>
                  {fipeModels.map(m => <option key={m.code} value={m.code}>{toTitleCase(m.name)}</option>)}
                </select>
              </div>

              <FInput label="Versão" value={form.version} onChange={v => set("version", v)}
                placeholder={isMoto ? "Ex: CB 500F ABS" : "Ex: LTZ 1.0 Turbo Premier"} />

              {!isMoto && (
                <FSelect label="Carroceria" value={form.bodyType} onChange={v => set("bodyType", v)}>
                  <option value="">Selecione</option>
                  {bodyOptions.map(b => <option key={b}>{b}</option>)}
                </FSelect>
              )}
            </div>
          </div>

          {/* Final da placa — só carro */}
          {!isMoto && (
            <div className="rounded-xl border border-black/10 bg-white p-6">
              <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">Final da placa</p>
              <div className="flex flex-wrap gap-2">
                {plateEndOptions.map(opt => (
                  <button key={opt} type="button"
                    onClick={() => set("plateEnd", form.plateEnd === opt ? "" : opt)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all
                      ${form.plateEnd === opt ? "border-primary-container bg-primary-container/10 text-gray-900" : "border-black/10 text-gray-400 hover:border-black/20"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Condição */}
          <div className="rounded-xl border border-black/10 bg-white p-6">
            <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">Condição</p>
            <div className="flex gap-4">
              {["Novo", "Usado"].map(c => (
                <label key={c} className="flex-1 cursor-pointer">
                  <input type="radio" name="condition" value={c} checked={form.condition === c}
                    onChange={() => set("condition", c)} className="sr-only peer" />
                  <div className="flex items-center justify-center gap-2 border-2 border-black/10 peer-checked:border-primary-container peer-checked:bg-primary-container/10 rounded-xl p-4 transition-all">
                    <Icon name={c === "Novo" ? "new_releases" : isMoto ? "two_wheeler" : "directions_car"} className="text-lg text-gray-600" />
                    <span className="font-bold text-sm text-gray-900">{c}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Ano & KM */}
          <div className="rounded-xl border border-black/10 bg-white p-6 space-y-5">
            <p className="text-xs font-black uppercase tracking-wider text-gray-400 border-b border-black/5 pb-3">Ano & Quilometragem</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <label className={lblCls}>
                  Ano * {loadingYears && <span className="normal-case font-normal text-gray-300">(carregando...)</span>}
                </label>
                <select value={form.fipeYearCode} disabled={!form.fipeModelCode || loadingYears} className={iCls}
                  onChange={e => { const opt = fipeYears.find(y => y.code === e.target.value); onYearChange(e.target.value, opt?.name ?? ""); }}>
                  <option value="">Selecione o ano</option>
                  {fipeYears.map(y => <option key={y.code} value={y.code}>{y.name}</option>)}
                </select>
                {form.fuel && (
                  <p className="mt-1.5 text-xs text-gray-400 flex items-center gap-1">
                    <Icon name="local_gas_station" className="text-sm" /> Combustível detectado: <strong className="text-gray-700">{form.fuel}</strong>
                  </p>
                )}
              </div>
              <FInput label="Quilometragem *" type="number" value={form.km} onChange={v => set("km", v)} placeholder="0" />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 1: Especificações ── */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="rounded-xl border border-black/10 bg-white p-6 space-y-5">
            <p className="text-xs font-black uppercase tracking-wider text-gray-400 border-b border-black/5 pb-3">Especificações</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FSelect label="Combustível *" value={form.fuel} onChange={v => set("fuel", v)}>
                <option value="">Selecione</option>
                {(isMoto ? motoFuelOptions : fuelOptions).map(o => <option key={o}>{o}</option>)}
              </FSelect>

              {isMoto ? (
                <FSelect label="Tipo de motor" value={form.engineType} onChange={v => set("engineType", v)}>
                  <option value="">Selecione</option>
                  {engineTypeOptions.map(o => <option key={o}>{o}</option>)}
                </FSelect>
              ) : (
                <FSelect label="Câmbio *" value={form.transmission} onChange={v => set("transmission", v)}>
                  <option value="">Selecione</option>
                  {transmissionOptions.map(o => <option key={o}>{o}</option>)}
                </FSelect>
              )}

              <FSelect label="Cor primária" value={form.color} onChange={v => set("color", v)}>
                <option value="">Selecione</option>
                {colorOptions.map(c => <option key={c}>{c}</option>)}
              </FSelect>

              {isMoto ? (
                <FSelect label="Cor secundária" value={form.colorSecondary} onChange={v => set("colorSecondary", v)}>
                  <option value="">Selecione</option>
                  {colorOptions.map(c => <option key={c}>{c}</option>)}
                </FSelect>
              ) : (
                <FSelect label="Portas" value={form.doors} onChange={v => set("doors", v)}>
                  <option value="">Selecione</option>
                  {["2","3","4","5"].map(n => <option key={n} value={n}>{n} portas</option>)}
                </FSelect>
              )}

              {isMoto && (
                <>
                  <FInput label="Cilindrada (cc)" type="number" value={form.cylindercc} onChange={v => set("cylindercc", v)} placeholder="Ex: 500" />
                  <FSelect label="Número de marchas" value={form.gears} onChange={v => set("gears", v)}>
                    <option value="">Selecione</option>
                    {gearsOptions.map(g => <option key={g}>{g}</option>)}
                  </FSelect>
                  <FSelect label="Refrigeração" value={form.coolingType} onChange={v => set("coolingType", v)}>
                    <option value="">Selecione</option>
                    {coolingOptions.map(o => <option key={o}>{o}</option>)}
                  </FSelect>
                  <FSelect label="Tipo de partida" value={form.startType} onChange={v => set("startType", v)}>
                    <option value="">Selecione</option>
                    {startTypeOptions.map(o => <option key={o}>{o}</option>)}
                  </FSelect>
                  <FSelect label="Freio dianteiro/traseiro" value={form.brakeType} onChange={v => set("brakeType", v)}>
                    <option value="">Selecione</option>
                    {brakeTypeOptions.map(o => <option key={o}>{o}</option>)}
                  </FSelect>
                  <FSelect label="Estilo" value={form.motoType} onChange={v => set("motoType", v)}>
                    <option value="">Selecione</option>
                    {motoStyleOptions.map(o => <option key={o}>{o}</option>)}
                  </FSelect>
                  <FSelect label="Necessidade" value={form.motoNeed} onChange={v => set("motoNeed", v)}>
                    <option value="">Selecione</option>
                    {motoNeedOptions.map(o => <option key={o}>{o}</option>)}
                  </FSelect>
                </>
              )}
            </div>
          </div>

          {!isMoto && (
            <>
              <FeatureBlock title="Características" features={FEATURES_CARACTERISTICAS} selected={form.features} onToggle={toggleFeature} />
              <FeatureBlock title="Extras do veículo" features={FEATURES_EXTRAS} selected={form.features} onToggle={toggleFeature} />
              <FeatureBlock title="Segurança" features={FEATURES_SEGURANCA} selected={form.features} onToggle={toggleFeature} />
              <FeatureBlock title="Tecnologia e conectividade" features={FEATURES_TECH} selected={form.features} onToggle={toggleFeature} />
              <FeatureBlock title="Outros" features={FEATURES_OUTROS} selected={form.features} onToggle={toggleFeature} />
            </>
          )}
          {isMoto && (
            <FeatureBlock title="Características" features={FEATURES_MOTO} selected={form.features} onToggle={toggleFeature} />
          )}

          <div className="rounded-xl border border-black/10 bg-white p-6">
            <p className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">Descrição</p>
            <textarea rows={5} value={form.description} onChange={e => set("description", e.target.value)}
              placeholder={isMoto ? "Descreva o estado da moto, histórico de manutenção, opcionais..." : "Descreva o estado do veículo, histórico de manutenção, opcionais..."}
              className="w-full border border-black/10 bg-gray-50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none resize-none" />
          </div>
        </div>
      )}

      {/* ── Step 2: Preço ── */}
      {step === 2 && (
        <div className="rounded-xl border border-black/10 bg-white p-6 space-y-6">
          <p className="text-xs font-black uppercase tracking-wider text-gray-400 border-b border-black/5 pb-3">Preço de venda</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={lblCls}>Valor de venda (R$) *</label>
              <input type="text" inputMode="numeric" value={form.price}
                onChange={e => set("price", e.target.value)} placeholder="0"
                className="w-full border border-primary-container/50 bg-primary-container/5 rounded-xl p-4 text-2xl font-black focus:ring-2 focus:ring-primary-container outline-none" />
            </div>
            <div className="flex flex-col gap-4 justify-center">
              {[
                { field: "acceptTrade", label: "Aceito troca" },
                { field: "financing",   label: "Financiamento disponível" },
              ].map(({ field, label }) => (
                <label key={field} className="flex items-center gap-3 cursor-pointer text-sm text-gray-700 font-medium">
                  <input type="checkbox" checked={form[field as keyof typeof form] as boolean}
                    onChange={e => set(field, e.target.checked)} className="w-4 h-4 accent-yellow-500" />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Fotos ── */}
      {step === 3 && (
        <div className="rounded-xl border border-black/10 bg-white p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-black/5 pb-3">
            <p className="text-xs font-black uppercase tracking-wider text-gray-400">Fotos do veículo</p>
            <p className="text-xs text-gray-400">Mínimo 3 · Máximo 20 · JPG, PNG ou WebP · Até 10MB</p>
          </div>

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-black/10 rounded-xl p-12 cursor-pointer hover:border-primary-container transition-colors">
            <Icon name="add_photo_alternate" className="text-5xl text-gray-300 mb-3" />
            <p className="font-black text-gray-700 mb-1">Clique para selecionar fotos</p>
            <p className="text-xs text-gray-400">A primeira foto será a capa do anúncio</p>
            <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only"
              onChange={e => setPhotos(prev => [...prev, ...Array.from(e.target.files ?? [])].slice(0, 20))} />
          </label>

          {photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {photos.map((f, i) => (
                <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <div className="absolute top-1 left-1 bg-primary-container text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Capa</div>
                  )}
                  <button type="button" onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon name="close" className="text-xs text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navegação */}
      <div className="flex items-center justify-between pt-6">
        {step > 0 ? (
          <button onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
            <Icon name="arrow_back" className="text-base" /> Voltar
          </button>
        ) : <div />}

        <button onClick={handleNext} disabled={loading || uploadingPhotos}
          className="flex items-center gap-2 rounded-xl bg-primary-container px-8 py-2.5 text-sm font-black text-black hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-primary-container/20">
          {(loading || uploadingPhotos) && (
            <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          )}
          {step === 3 ? "Publicar anúncio" : "Próximo"}
          {step < 3 && <Icon name="arrow_forward" className="text-base" />}
        </button>
      </div>
    </ErpLayout>
  );
}
