"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";

const transmissionOptions     = ["Automático","Manual","CVT","Automatizado"];
const motoTransmissionOptions = ["Manual","Automático","Semiautomático"];
const bodyOptions      = ["Hatch","Sedã","SUV/Crossover","Picape","Minivan","Esportivo","Conversível"];
const motoTypeOptions  = ["Street","Naked","Esportiva","Trail/Adventure","Custom/Cruiser","Scooter","Enduro/Motocross","Touring"];
const colorOptions     = ["Branco","Prata","Preto","Cinza","Vermelho","Azul","Verde","Amarelo","Laranja","Marrom","Bege","Dourado","Vinho","Outro"];

interface FipeItem { code: string; name: string; }

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

export default function EditarPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const [vehicleType, setVehicleType] = useState("CAR");

  // FIPE
  const [fipeBrands, setFipeBrands] = useState<FipeItem[]>([]);
  const [fipeModels, setFipeModels] = useState<FipeItem[]>([]);
  const [fipeYears, setFipeYears]   = useState<FipeItem[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingYears, setLoadingYears]   = useState(false);

  const [form, setForm] = useState({
    brand: "", model: "", version: "", bodyType: "",
    motoType: "", cylindercc: "",
    condition: "Usado",
    yearFab: "", yearModel: "", km: "",
    fuel: "", transmission: "", color: "", doors: "",
    price: "", acceptTrade: false, financing: false, armored: false, auction: false,
    description: "", city: "", state: "",
    fipeBrandCode: "", fipeModelCode: "", fipeYearCode: "",
  });

  const [existingPhotos, setExistingPhotos] = useState<{ id: string; url: string; order: number; isCover: boolean }[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [savingPhotos, setSavingPhotos] = useState(false);

  // Carregar dados do veículo primeiro, depois marcas FIPE com o tipo correto
  useEffect(() => {
    fetch(`/api/vehicles/${id}`)
      .then(r => r.json())
      .then(async data => {
        const v = data.vehicle;
        if (!v) { router.push("/perfil/meus-anuncios"); return; }

        const type = v.vehicleType ?? "CAR";
        setVehicleType(type);

        setForm({
          brand:        v.brand        ?? "",
          model:        v.model        ?? "",
          version:      v.version      ?? "",
          bodyType:     v.bodyType     ?? "",
          motoType:     v.motoType     ?? "",
          cylindercc:   v.cylindercc   ? String(v.cylindercc) : "",
          condition:    v.condition === "NEW" ? "Novo" : "Usado",
          yearFab:      String(v.yearFab   ?? ""),
          yearModel:    String(v.yearModel ?? ""),
          km:           String(v.km        ?? ""),
          fuel:         v.fuel         ?? "",
          transmission: v.transmission ?? "",
          color:        v.color        ?? "",
          doors:        v.doors        ? String(v.doors) : "",
          price:        String(v.price ?? ""),
          acceptTrade:  v.acceptTrade  ?? false,
          financing:    v.financing    ?? false,
          armored:      v.armored      ?? false,
          auction:      v.auction      ?? false,
          description:  v.description  ?? "",
          city:         v.city         ?? "",
          state:        v.state        ?? "",
          fipeBrandCode: v.fipeBrandCode ?? "",
          fipeModelCode: v.fipeModelCode ?? "",
          fipeYearCode:  v.fipeYearCode  ?? "",
        });

        // Carregar fotos existentes ordenadas
        const sorted = [...(v.photos ?? [])].sort((a: { order: number }, b: { order: number }) => a.order - b.order);
        setExistingPhotos(sorted);

        // Carregar marcas FIPE com o tipo correto
        setLoadingBrands(true);
        const brandsRes = await fetch(`/api/fipe/brands?vehicleType=${type}`);
        const brandsData = await brandsRes.json();
        setFipeBrands(Array.isArray(brandsData) ? brandsData : []);
        setLoadingBrands(false);

        // Pré-carregar modelos e anos se já tiver códigos FIPE
        if (v.fipeBrandCode) {
          setLoadingModels(true);
          const modelsRes = await fetch(`/api/fipe/brands/${v.fipeBrandCode}/models?vehicleType=${type}`);
          const modelsData = await modelsRes.json();
          const models = Array.isArray(modelsData) ? modelsData : (modelsData.models ?? []);
          setFipeModels(models.map((m: FipeItem) => ({ ...m, code: String(m.code) })));
          setLoadingModels(false);

          if (v.fipeModelCode) {
            setLoadingYears(true);
            const yearsRes = await fetch(`/api/fipe/brands/${v.fipeBrandCode}/models/${v.fipeModelCode}/years?vehicleType=${type}`);
            const yearsData = await yearsRes.json();
            setFipeYears((Array.isArray(yearsData) ? yearsData : []).map((y: FipeItem) => ({ ...y, code: String(y.code) })));
            setLoadingYears(false);
          }
        }

        setLoading(false);
      })
      .catch(() => router.push("/perfil/meus-anuncios"));
  }, [id, router]);

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function onBrandChange(code: string, name: string) {
    setForm(f => ({ ...f, fipeBrandCode: code, brand: toTitleCase(name), fipeModelCode: "", model: "", fipeYearCode: "", yearFab: "", yearModel: "", fuel: "" }));
    setFipeModels([]); setFipeYears([]);
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

  async function deletePhoto(photoId: string) {
    await fetch(`/api/vehicles/${id}/photos?photoId=${photoId}`, { method: "DELETE" });
    setExistingPhotos(prev => {
      const updated = prev.filter(p => p.id !== photoId).map((p, i) => ({ ...p, order: i, isCover: i === 0 }));
      savePhotoOrder(updated);
      return updated;
    });
  }

  async function movePhoto(index: number, dir: -1 | 1) {
    const next = index + dir;
    setExistingPhotos(prev => {
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[index], arr[next]] = [arr[next], arr[index]];
      const updated = arr.map((p, i) => ({ ...p, order: i, isCover: i === 0 }));
      savePhotoOrder(updated);
      return updated;
    });
  }

  async function savePhotoOrder(photos: { id: string; order: number; isCover: boolean }[]) {
    setSavingPhotos(true);
    await fetch(`/api/vehicles/${id}/photos`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orders: photos.map(p => ({ id: p.id, order: p.order, isCover: p.isCover })) }),
    });
    setSavingPhotos(false);
  }

  async function handleSave() {
    setError("");
    if (!form.fipeBrandCode || !form.fipeModelCode || !form.fipeYearCode) {
      setError("Selecione a marca, modelo e ano pela tabela FIPE."); return;
    }
    setSaving(true);

    const res = await fetch(`/api/vehicles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        vehicleType,
        yearFab:    Number(form.yearFab),
        yearModel:  Number(form.yearFab),
        km:         Number(form.km),
        price:      Number(String(form.price).replace(/\D/g, "")),
        doors:      form.doors      ? Number(form.doors)      : null,
        cylindercc: form.cylindercc ? Number(form.cylindercc) : null,
        condition:  form.condition === "Novo" ? "NEW" : "USED",
      }),
    });

    if (res.ok && newPhotos.length > 0) {
      const fd = new FormData();
      newPhotos.forEach(f => fd.append("photos", f));
      await fetch(`/api/vehicles/${id}/photos`, { method: "POST", body: fd });
    }

    setSaving(false);

    if (!res.ok) {
      try { const d = await res.json(); setError(d.error ?? "Erro ao salvar."); }
      catch { setError(`Erro ao salvar (${res.status}).`); }
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/perfil/meus-anuncios"), 1200);
  }

  const isMoto = vehicleType === "MOTO";

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="w-8 h-8 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-surface-container transition-colors">
          <Icon name="arrow_back" className="text-xl" />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-on-surface uppercase flex items-center gap-2">
            <Icon name={isMoto ? "two_wheeler" : "directions_car"} className="text-2xl" />
            Editar {isMoto ? "Moto" : "Carro"}
          </h1>
          <p className="text-on-surface-variant text-sm mt-0.5">Atualize as informações do seu veículo.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-error/10 text-error rounded-xl px-4 py-3 text-sm font-medium">
          <Icon name="error" className="text-lg flex-shrink-0" />{error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
          <Icon name="check_circle" className="text-lg flex-shrink-0" />Anúncio atualizado com sucesso!
        </div>
      )}

      {/* Identificação */}
      <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-6">
        <h2 className="text-base font-bold text-on-surface border-b border-neutral-100 pb-4">Identificação</h2>

        {!form.fipeBrandCode && (
          <div className="flex items-start gap-3 bg-primary-container/15 rounded-xl px-4 py-3 text-sm">
            <Icon name="info" className="text-primary text-lg flex-shrink-0 mt-0.5" />
            <p className="text-on-surface">Selecione a marca, modelo e ano pela <strong>Tabela FIPE</strong> para exibir o valor FIPE no anúncio.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Marca — FIPE */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Marca * {loadingBrands && <span className="text-outline normal-case font-normal">(carregando...)</span>}
            </label>
            <select
              value={form.fipeBrandCode}
              onChange={e => { const opt = fipeBrands.find(b => b.code === e.target.value); onBrandChange(e.target.value, opt?.name ?? ""); }}
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
              onChange={e => { const opt = fipeModels.find(m => m.code === e.target.value); onModelChange(e.target.value, opt?.name ?? ""); }}
              disabled={!form.fipeBrandCode || loadingModels}
              className="bg-surface-container-low border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none disabled:opacity-50"
            >
              <option value="">Selecione o modelo</option>
              {fipeModels.map(m => <option key={m.code} value={m.code}>{toTitleCase(m.name)}</option>)}
            </select>
          </div>

          <FormInput label="Versão" value={form.version} onChange={v => set("version", v)} placeholder={isMoto ? "Ex: CB 500F ABS" : "Ex: LTZ 1.0 Turbo"} />

          {isMoto ? (
            <FormSelect label="Tipo de moto" value={form.motoType} onChange={v => set("motoType", v)}>
              <option value="">Selecione</option>
              {motoTypeOptions.map(t => <option key={t}>{t}</option>)}
            </FormSelect>
          ) : (
            <FormSelect label="Carroceria" value={form.bodyType} onChange={v => set("bodyType", v)}>
              <option value="">Selecione</option>
              {bodyOptions.map(b => <option key={b}>{b}</option>)}
            </FormSelect>
          )}
        </div>
      </div>

      {/* Condição */}
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

      {/* Ano & KM */}
      <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-6">
        <h2 className="text-base font-bold text-on-surface border-b border-neutral-100 pb-4">Ano & Quilometragem</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Ano * {loadingYears && <span className="text-outline normal-case font-normal">(carregando...)</span>}
            </label>
            <select
              value={form.fipeYearCode}
              onChange={e => { const opt = fipeYears.find(y => y.code === e.target.value); onYearChange(e.target.value, opt?.name ?? ""); }}
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

      {/* Especificações */}
      <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-6">
        <h2 className="text-base font-bold text-on-surface border-b border-neutral-100 pb-4">Especificações</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            { field: "armored", label: isMoto ? "Moto blindada"  : "Veículo blindado" },
            { field: "auction", label: isMoto ? "Moto de leilão" : "Veículo de leilão" },
          ].map(({ field, label }) => (
            <label key={field} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form[field as keyof typeof form] as boolean} onChange={e => set(field, e.target.checked)} className="w-4 h-4 accent-yellow-500" />
              <span className="text-sm font-medium text-on-surface">{label}</span>
            </label>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Descrição</label>
          <textarea rows={5} value={form.description} onChange={e => set("description", e.target.value)}
            placeholder={isMoto ? "Descreva o estado da moto, histórico de manutenção, opcionais..." : "Descreva o estado do veículo, histórico de manutenção, opcionais..."}
            className="w-full bg-surface-container-low border-0 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary-container outline-none resize-none" />
        </div>
      </div>

      {/* Preço */}
      <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-6">
        <h2 className="text-base font-bold text-on-surface border-b border-neutral-100 pb-4">Preço</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Valor de venda (R$) *</label>
            <input type="text" inputMode="numeric" value={form.price} onChange={e => set("price", e.target.value)} placeholder="0"
              className="bg-primary-container/10 border-0 rounded-xl p-4 text-xl font-black focus:ring-2 focus:ring-primary-container outline-none" />
          </div>
          <div className="flex flex-col gap-3 justify-center">
            {[{ field: "acceptTrade", label: "Aceito troca" }, { field: "financing", label: "Financiamento disponível" }].map(({ field, label }) => (
              <label key={field} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form[field as keyof typeof form] as boolean} onChange={e => set(field, e.target.checked)} className="w-4 h-4 accent-yellow-500" />
                <span className="text-sm font-medium text-on-surface">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Localização */}
      <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-6">
        <h2 className="text-base font-bold text-on-surface border-b border-neutral-100 pb-4">Localização</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput label="Cidade" value={form.city} onChange={v => set("city", v)} placeholder="São Paulo" />
          <FormInput label="Estado" value={form.state} onChange={v => set("state", v)} placeholder="SP" />
        </div>
      </div>

      {/* Fotos existentes */}
      <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <h2 className="text-base font-bold text-on-surface">
            Fotos {savingPhotos && <span className="text-xs text-outline font-normal ml-1">salvando...</span>}
          </h2>
          <span className="text-xs text-on-surface-variant">{existingPhotos.length} foto{existingPhotos.length !== 1 ? "s" : ""}</span>
        </div>

        {existingPhotos.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {existingPhotos.map((photo, i) => (
              <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden bg-surface-container">
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
                {photo.isCover && (
                  <div className="absolute top-1 left-1 bg-primary-container text-on-primary-container text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Capa</div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => movePhoto(i, -1)}
                    disabled={i === 0}
                    className="w-7 h-7 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center disabled:opacity-30 transition-colors"
                  >
                    <Icon name="chevron_left" className="text-white text-sm" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePhoto(photo.id)}
                    className="w-7 h-7 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                  >
                    <Icon name="delete" className="text-white text-sm" />
                  </button>
                  <button
                    type="button"
                    onClick={() => movePhoto(i, 1)}
                    disabled={i === existingPhotos.length - 1}
                    className="w-7 h-7 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center disabled:opacity-30 transition-colors"
                  >
                    <Icon name="chevron_right" className="text-white text-sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-on-surface-variant text-center py-4">Nenhuma foto cadastrada.</p>
        )}

        <label className="flex flex-col items-center justify-center border-2 border-dashed border-outline-variant rounded-2xl p-8 cursor-pointer hover:border-primary-container transition-colors">
          <Icon name="add_photo_alternate" className="text-3xl text-outline mb-2" />
          <p className="font-bold text-on-surface text-sm">Adicionar mais fotos</p>
          <p className="text-xs text-outline mt-0.5">Máx. {20 - existingPhotos.length} foto{20 - existingPhotos.length !== 1 ? "s" : ""} restante{20 - existingPhotos.length !== 1 ? "s" : ""}</p>
          <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only"
            onChange={e => setNewPhotos(prev => [...prev, ...Array.from(e.target.files ?? [])].slice(0, 20 - existingPhotos.length))} />
        </label>

        {newPhotos.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {newPhotos.map((f, i) => (
              <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-surface-container">
                <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setNewPhotos(prev => prev.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icon name="close" className="text-xs text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save */}
      <div className="flex justify-end pb-8">
        <button onClick={handleSave} disabled={saving}
          className="bg-primary-container text-on-primary-container px-12 py-3 rounded-full font-black uppercase tracking-widest text-sm hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-60">
          {saving && <span className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />}
          <Icon name="save" className="text-base" />
          Salvar alterações
        </button>
      </div>

    </div>
  );
}

function FormInput({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="bg-surface-container-low border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none" />
    </div>
  );
}

function FormSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="bg-surface-container-low border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none">
        {children}
      </select>
    </div>
  );
}
