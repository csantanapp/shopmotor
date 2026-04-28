"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";

const steps = ["Dados básicos", "Especificações", "Preço", "Fotos"];

const fuelOptions        = ["Flex","Gasolina","Etanol","Diesel","Elétrico","Híbrido","GNV"];
const motoFuelOptions    = ["Gasolina","Etanol","Flex","Elétrico"];
const transmissionOptions     = ["Automático","Manual","CVT","Automatizado"];
const motoTransmissionOptions = ["Manual","Automático","Semiautomático"];
const bodyOptions  = ["Hatch","Sedã","SUV/Crossover","Picape","Minivan","Esportivo","Conversível"];
const motoTypeOptions = ["Street","Naked","Esportiva","Trail/Adventure","Custom/Cruiser","Scooter","Enduro/Motocross","Touring"];
const colorOptions = ["Branco","Prata","Preto","Cinza","Vermelho","Azul","Verde","Amarelo","Laranja","Marrom","Bege","Dourado","Vinho","Outro"];

function toTitleCase(str: string) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function fuelFromFipe(yearName: string): string {
  const n = yearName.toLowerCase();
  if (n.includes("gasolina")) return "Gasolina";
  if (n.includes("álcool") || n.includes("alcool") || n.includes("etanol")) return "Etanol";
  if (n.includes("diesel")) return "Diesel";
  if (n.includes("elétrico") || n.includes("eletrico")) return "Elétrico";
  if (n.includes("flex")) return "Flex";
  if (n.includes("gnv")) return "GNV";
  return "";
}

interface FipeItem { code: string; name: string; }

export default function CadastrarPage() {
  const router = useRouter();
  const [vehicleType, setVehicleType] = useState<"CAR" | "MOTO" | null>(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [vehicleId, setVehicleId] = useState<string | null>(null);

  // FIPE cascading state
  const [fipeBrands, setFipeBrands] = useState<FipeItem[]>([]);
  const [fipeModels, setFipeModels] = useState<FipeItem[]>([]);
  const [fipeYears, setFipeYears]   = useState<FipeItem[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingYears, setLoadingYears]   = useState(false);

  // Form state
  const [form, setForm] = useState({
    brand: "", model: "", version: "", bodyType: "",
    condition: "Usado",
    yearFab: "", yearModel: "", km: "",
    fuel: "", transmission: "", color: "", doors: "",
    cylindercc: "", motoType: "",
    price: "", acceptTrade: false, financing: false, armored: false, auction: false,
    description: "",
    fipeBrandCode: "", fipeModelCode: "", fipeYearCode: "",
  });

  // Carregar marcas FIPE ao escolher tipo
  useEffect(() => {
    if (!vehicleType) return;
    setLoadingBrands(true);
    fetch(`/api/fipe/brands?vehicleType=${vehicleType}`)
      .then(r => r.json())
      .then(data => setFipeBrands(Array.isArray(data) ? data : []))
      .finally(() => setLoadingBrands(false));
  }, [vehicleType]);

  async function onBrandChange(code: string, name: string) {
    setForm(f => ({ ...f, fipeBrandCode: code, brand: toTitleCase(name), fipeModelCode: "", model: "", fipeYearCode: "", yearFab: "", yearModel: "", fuel: "" }));
    setFipeModels([]);
    setFipeYears([]);
    if (!code) return;
    setLoadingModels(true);
    const res = await fetch(`/api/fipe/brands/${code}/models?vehicleType=${vehicleType}`);
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
    const res = await fetch(`/api/fipe/brands/${form.fipeBrandCode}/models/${code}/years?vehicleType=${vehicleType}`);
    const data = await res.json();
    setFipeYears((Array.isArray(data) ? data : []).map((y: FipeItem) => ({ ...y, code: String(y.code) })));
    setLoadingYears(false);
  }

  function onYearChange(code: string, name: string) {
    const year = parseInt(name);
    const fuel = fuelFromFipe(name);
    setForm(f => ({ ...f, fipeYearCode: code, yearFab: String(year), yearModel: String(year), fuel }));
  }

  // Photos
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function submitBasicData() {
    setError("");
    if (!form.fipeBrandCode || !form.fipeModelCode || !form.fipeYearCode || !form.km) {
      setError("Selecione a marca, modelo, ano e informe a quilometragem."); return false;
    }
    return true;
  }

  async function submitVehicle() {
    setError("");
    setLoading(true);

    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        vehicleType,
        yearFab:  Number(form.yearFab),
        yearModel: Number(form.yearFab),
        km:    Number(form.km),
        price: Number(String(form.price).replace(/\D/g, "")),
        doors: form.doors ? Number(form.doors) : null,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Erro ao criar anúncio."); return false; }
    setVehicleId(data.vehicle.id);
    return true;
  }

  async function uploadPhotos() {
    if (!vehicleId || photos.length === 0) return true;
    setUploadingPhotos(true);
    const fd = new FormData();
    photos.forEach(f => fd.append("photos", f));
    await fetch(`/api/vehicles/${vehicleId}/photos`, { method: "POST", body: fd });
    setUploadingPhotos(false);
    return true;
  }

  async function handleNext() {
    if (step === 0) {
      if (!await submitBasicData()) return;
    }
    if (step === 2) {
      if (!await submitVehicle()) return;
    }
    if (step === 3) {
      if (photos.length < 3) {
        setError("Adicione pelo menos 3 fotos para publicar o anúncio.");
        return;
      }
      await uploadPhotos();
      const limitRes = await fetch("/api/vehicles/check-limit");
      const { overLimit } = await limitRes.json();
      if (overLimit) {
        router.push(`/perfil/limite-atingido/${vehicleId}`);
      } else {
        router.push(`/perfil/impulsionar/${vehicleId}?novo=1`);
      }
      return;
    }
    setStep(s => s + 1);
  }

  // ── Type selection screen ──
  if (!vehicleType) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-on-surface uppercase">Cadastrar Veículo</h1>
          <p className="text-on-surface-variant text-sm mt-1">Escolha o tipo de veículo que deseja anunciar.</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <button
            onClick={() => setVehicleType("CAR")}
            className="group flex flex-col items-center justify-center gap-4 bg-surface-container-lowest rounded-2xl p-10 shadow-sm border-2 border-transparent hover:border-primary-container hover:bg-primary-container/5 transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-surface-container-high group-hover:bg-primary-container/20 flex items-center justify-center transition-colors">
              <Icon name="directions_car" className="text-4xl text-on-surface" />
            </div>
            <div className="text-center">
              <p className="font-black text-on-surface uppercase tracking-tight text-lg">Carro</p>
              <p className="text-xs text-on-surface-variant mt-1">Carros, SUVs, Pickups e mais</p>
            </div>
          </button>

          <button
            onClick={() => setVehicleType("MOTO")}
            className="group flex flex-col items-center justify-center gap-4 bg-surface-container-lowest rounded-2xl p-10 shadow-sm border-2 border-transparent hover:border-primary-container hover:bg-primary-container/5 transition-all"
          >
            <div className="w-16 h-16 rounded-2xl bg-surface-container-high group-hover:bg-primary-container/20 flex items-center justify-center transition-colors">
              <Icon name="two_wheeler" className="text-4xl text-on-surface" />
            </div>
            <div className="text-center">
              <p className="font-black text-on-surface uppercase tracking-tight text-lg">Moto</p>
              <p className="text-xs text-on-surface-variant mt-1">Motos, scooters e esportivas</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  const isMoto = vehicleType === "MOTO";

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => setVehicleType(null)} className="p-2 rounded-full hover:bg-surface-container transition-colors">
          <Icon name="arrow_back" className="text-on-surface" />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-on-surface uppercase flex items-center gap-2">
            <Icon name={isMoto ? "two_wheeler" : "directions_car"} className="text-2xl" />
            Cadastrar {isMoto ? "Moto" : "Carro"}
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">Preencha os dados do veículo para publicar seu anúncio.</p>
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-2 ${i <= step ? "text-on-surface" : "text-outline"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${i < step ? "bg-green-500 text-white" : i === step ? "bg-primary-container text-on-primary-container" : "bg-surface-container-high text-outline"}`}>
                {i < step ? <Icon name="check" className="text-sm" /> : i + 1}
              </div>
              <span className="text-xs font-semibold hidden sm:block">{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-px ${i < step ? "bg-green-400" : "bg-outline-variant"}`} />}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-error/10 text-error rounded-xl px-4 py-3 text-sm font-medium">
          <Icon name="error" className="text-lg flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Step 0: Dados básicos */}
      {step === 0 && (
        <div className="space-y-6">
          <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-6">
            <h2 className="text-base font-bold text-on-surface border-b border-neutral-100 pb-4">Identificação</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Marca — FIPE */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Marca * {loadingBrands && <span className="text-outline normal-case font-normal">(carregando...)</span>}
                </label>
                <select
                  value={form.fipeBrandCode}
                  onChange={e => {
                    const opt = fipeBrands.find(b => b.code === e.target.value);
                    onBrandChange(e.target.value, opt?.name ?? "");
                  }}
                  disabled={loadingBrands}
                  className="bg-surface-container-low border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none disabled:opacity-50"
                >
                  <option value="">Selecione a marca</option>
                  {fipeBrands.map(b => <option key={b.code} value={b.code}>{toTitleCase(b.name)}</option>)}
                </select>
              </div>

              {/* Modelo — FIPE */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Modelo * {loadingModels && <span className="text-outline normal-case font-normal">(carregando...)</span>}
                </label>
                <select
                  value={form.fipeModelCode}
                  onChange={e => {
                    const opt = fipeModels.find(m => m.code === e.target.value);
                    onModelChange(e.target.value, opt?.name ?? "");
                  }}
                  disabled={!form.fipeBrandCode || loadingModels}
                  className="bg-surface-container-low border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none disabled:opacity-50"
                >
                  <option value="">Selecione o modelo</option>
                  {fipeModels.map(m => <option key={m.code} value={m.code}>{toTitleCase(m.name)}</option>)}
                </select>
              </div>

              <FormInput label="Versão" value={form.version} onChange={v => set("version", v)} placeholder={isMoto ? "Ex: CB 500F ABS" : "Ex: LTZ 1.0 Turbo Premier"} />

              {isMoto ? (
                <FormSelect label="Tipo de moto" value={form.motoType} onChange={v => set("motoType", v)}>
                  <option value="">Selecione</option>
                  {motoTypeOptions.map(b => <option key={b}>{b}</option>)}
                </FormSelect>
              ) : (
                <FormSelect label="Carroceria" value={form.bodyType} onChange={v => set("bodyType", v)}>
                  <option value="">Selecione</option>
                  {bodyOptions.map(b => <option key={b}>{b}</option>)}
                </FormSelect>
              )}
            </div>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-base font-bold text-on-surface border-b border-neutral-100 pb-4">Condição</h2>
            <div className="flex gap-4">
              {["Novo", "Usado"].map(c => (
                <label key={c} className="flex-1 cursor-pointer">
                  <input type="radio" name="condition" value={c} checked={form.condition === c} onChange={() => set("condition", c)} className="sr-only peer" />
                  <div className="flex items-center justify-center gap-2 border-2 border-outline-variant peer-checked:border-primary-container peer-checked:bg-primary-container/10 rounded-xl p-4 transition-all">
                    <Icon name={c === "Novo" ? "new_releases" : isMoto ? "two_wheeler" : "directions_car"} className="text-xl text-on-surface" />
                    <span className="font-bold text-sm text-on-surface">{c}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-6">
            <h2 className="text-base font-bold text-on-surface border-b border-neutral-100 pb-4">Ano & Quilometragem</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Ano — FIPE */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Ano * {loadingYears && <span className="text-outline normal-case font-normal">(carregando...)</span>}
                </label>
                <select
                  value={form.fipeYearCode}
                  onChange={e => {
                    const opt = fipeYears.find(y => y.code === e.target.value);
                    onYearChange(e.target.value, opt?.name ?? "");
                  }}
                  disabled={!form.fipeModelCode || loadingYears}
                  className="bg-surface-container-low border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none disabled:opacity-50"
                >
                  <option value="">Selecione o ano</option>
                  {fipeYears.map(y => <option key={y.code} value={y.code}>{y.name}</option>)}
                </select>
                {form.fuel && (
                  <p className="text-xs text-on-surface-variant flex items-center gap-1">
                    <Icon name="local_gas_station" className="text-sm" />Combustível detectado: <strong>{form.fuel}</strong>
                  </p>
                )}
              </div>

              <FormInput label="Quilometragem *" type="number" value={form.km} onChange={v => set("km", v)} placeholder="0" />
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Especificações */}
      {step === 1 && (
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-6">
          <h2 className="text-base font-bold text-on-surface border-b border-neutral-100 pb-4">Especificações</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelect label="Combustível *" value={form.fuel} onChange={v => set("fuel", v)}>
              <option value="">Selecione</option>
              {(isMoto ? motoFuelOptions : fuelOptions).map(opt => <option key={opt}>{opt}</option>)}
            </FormSelect>
            <FormSelect label="Câmbio *" value={form.transmission} onChange={v => set("transmission", v)}>
              <option value="">Selecione</option>
              {(isMoto ? motoTransmissionOptions : transmissionOptions).map(t => <option key={t}>{t}</option>)}
            </FormSelect>
            <FormSelect label="Cor" value={form.color} onChange={v => set("color", v)}>
              <option value="">Selecione</option>
              {colorOptions.map(c => <option key={c}>{c}</option>)}
            </FormSelect>
            {isMoto ? (
              <FormInput label="Cilindrada (cc)" type="number" value={form.cylindercc} onChange={v => set("cylindercc", v)} placeholder="Ex: 500" />
            ) : (
              <FormSelect label="Portas" value={form.doors} onChange={v => set("doors", v)}>
                <option value="">Selecione</option>
                {["2","3","4","5"].map(n => <option key={n} value={n}>{n} portas</option>)}
              </FormSelect>
            )}
          </div>

          <div className="space-y-3 pt-2">
            {[
              { field: "armored", label: isMoto ? "Moto blindada" : "Veículo blindado" },
              { field: "auction", label: isMoto ? "Moto de leilão" : "Veículo de leilão" },
            ].map(({ field, label }) => (
              <label key={field} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[field as keyof typeof form] as boolean}
                  onChange={e => set(field, e.target.checked)}
                  className="w-4 h-4 accent-yellow-500"
                />
                <span className="text-sm font-medium text-on-surface">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Descrição</label>
            <textarea
              rows={5}
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder={isMoto ? "Descreva o estado da moto, histórico de manutenção, opcionais..." : "Descreva o estado do veículo, histórico de manutenção, opcionais..."}
              className="w-full bg-surface-container-low border-0 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary-container outline-none resize-none"
            />
          </div>
        </div>
      )}

      {/* Step 2: Preço */}
      {step === 2 && (
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-6">
          <h2 className="text-base font-bold text-on-surface border-b border-neutral-100 pb-4">Preço</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Valor de venda (R$) *</label>
              <input
                type="text" inputMode="numeric"
                value={form.price}
                onChange={e => set("price", e.target.value)}
                placeholder="0,00"
                className="bg-primary-container/10 border-0 rounded-xl p-4 text-xl font-black focus:ring-2 focus:ring-primary-container outline-none"
              />
            </div>
            <div className="flex flex-col gap-3 justify-center">
              {[
                { field: "acceptTrade", label: "Aceito troca" },
                { field: "financing", label: "Financiamento disponível" },
              ].map(({ field, label }) => (
                <label key={field} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[field as keyof typeof form] as boolean}
                    onChange={e => set(field, e.target.checked)}
                    className="w-4 h-4 accent-yellow-500"
                  />
                  <span className="text-sm font-medium text-on-surface">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Fotos */}
      {step === 3 && (
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-6">
          <h2 className="text-base font-bold text-on-surface border-b border-neutral-100 pb-4">
            Fotos <span className="text-outline font-normal text-xs ml-1">Mínimo 3 fotos • Máximo 20 • JPG, PNG ou WebP • Até 10MB cada</span>
          </h2>

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-outline-variant rounded-2xl p-12 cursor-pointer hover:border-primary-container transition-colors">
            <Icon name="add_photo_alternate" className="text-5xl text-outline mb-3" />
            <p className="font-bold text-on-surface mb-1">Clique para selecionar fotos</p>
            <p className="text-xs text-outline">A primeira foto será a capa do anúncio</p>
            <input
              type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only"
              onChange={e => setPhotos(prev => [...prev, ...Array.from(e.target.files ?? [])].slice(0, 20))}
            />
          </label>

          {photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {photos.map((f, i) => (
                <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-surface-container">
                  <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <div className="absolute top-1 left-1 bg-primary-container text-on-primary-container text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Capa</div>
                  )}
                  <button
                    type="button"
                    onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Icon name="close" className="text-xs text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center pb-8">
        {step > 0 ? (
          <button type="button" onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-neutral-500 hover:bg-surface-container transition-colors">
            <Icon name="arrow_back" />
            Voltar
          </button>
        ) : (
          <div />
        )}
        <button
          type="button"
          onClick={handleNext}
          disabled={loading || uploadingPhotos}
          className="bg-primary-container text-on-primary-container px-12 py-3 rounded-full font-black uppercase tracking-widest text-sm shadow-[0px_8px_24px_rgba(255,215,9,0.25)] hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {(loading || uploadingPhotos) && <span className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />}
          {step === 3 ? "Publicar anúncio" : "Próximo"}
          {step < 3 && <Icon name="arrow_forward" />}
        </button>
      </div>

    </div>
  );
}

function FormInput({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="bg-surface-container-low border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none"
      />
    </div>
  );
}

function FormSelect({ label, value, onChange, children }: {
  label: string; value: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{label}</label>
      <select
        value={value} onChange={e => onChange(e.target.value)}
        className="bg-surface-container-low border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none"
      >
        {children}
      </select>
    </div>
  );
}
