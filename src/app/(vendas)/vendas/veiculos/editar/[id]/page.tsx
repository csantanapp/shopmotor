"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ErpLayout from "@/components/erp/ErpLayout";
import Icon from "@/components/ui/Icon";

const transmissionOptions     = ["Automático","Manual","CVT","Automatizado"];
const motoTransmissionOptions = ["Manual","Automático","Semiautomático"];
const bodyOptions      = ["Hatch","Sedã","SUV/Crossover","Picape","Minivan","Esportivo","Conversível"];
const motoTypeOptions  = ["Street","Naked","Esportiva","Trail/Adventure","Custom/Cruiser","Scooter","Enduro/Motocross","Touring"];
const colorOptions     = ["Branco","Prata","Preto","Cinza","Vermelho","Azul","Verde","Amarelo","Laranja","Marrom","Bege","Dourado","Vinho","Outro"];

interface FipeItem { code: string; name: string; }

function formatBRL(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("pt-BR");
}

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

export default function EditarVeiculoPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const [vehicleType, setVehicleType] = useState("CAR");

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

  useEffect(() => {
    fetch(`/api/vehicles/${id}`)
      .then(r => r.json())
      .then(async data => {
        const v = data.vehicle;
        if (!v) { router.push("/vendas/veiculos"); return; }

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

        const sorted = [...(v.photos ?? [])].sort((a: { order: number }, b: { order: number }) => a.order - b.order);
        setExistingPhotos(sorted);

        setLoadingBrands(true);
        const brandsRes = await fetch(`/api/fipe/brands?vehicleType=${type}`);
        const brandsData = await brandsRes.json();
        setFipeBrands(Array.isArray(brandsData) ? brandsData : []);
        setLoadingBrands(false);

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
      .catch(() => router.push("/vendas/veiculos"));
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
        price:      Number(form.price),
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
    setTimeout(() => router.push("/vendas/veiculos"), 1200);
  }

  const isMoto = vehicleType === "MOTO";

  return (
    <ErpLayout
      title={loading ? "Editar Veículo" : `Editar ${isMoto ? "Moto" : "Carro"}`}
      subtitle="Atualize as informações do seu veículo"
    >
      {/* Back */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/vendas/veiculos")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition"
        >
          <Icon name="arrow_back" className="text-base" />
          Voltar para Veículos
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <span className="h-8 w-8 rounded-full border-2 border-primary-container/30 border-t-primary-container animate-spin" />
        </div>
      ) : (
        <div className="max-w-3xl space-y-6">

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
              <Icon name="error" className="text-lg shrink-0" />{error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-xl px-4 py-3 text-sm font-medium">
              <Icon name="check_circle" className="text-lg shrink-0" />Anúncio atualizado com sucesso!
            </div>
          )}

          {/* Identificação */}
          <Section title="Identificação">
            {!form.fipeBrandCode && (
              <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm mb-4">
                <Icon name="info" className="text-yellow-600 text-lg shrink-0 mt-0.5" />
                <p className="text-yellow-800">Selecione a marca, modelo e ano pela <strong>Tabela FIPE</strong> para exibir o valor FIPE no anúncio.</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <EField label={`Marca${loadingBrands ? " (carregando...)" : " *"}`}>
                <select
                  value={form.fipeBrandCode}
                  onChange={e => { const opt = fipeBrands.find(b => b.code === e.target.value); onBrandChange(e.target.value, opt?.name ?? ""); }}
                  disabled={loadingBrands}
                  className={inputCls}
                >
                  <option value="">Selecione a marca</option>
                  {fipeBrands.map(b => <option key={b.code} value={b.code}>{toTitleCase(b.name)}</option>)}
                </select>
              </EField>

              <EField label={`Modelo${loadingModels ? " (carregando...)" : " *"}`}>
                <select
                  value={form.fipeModelCode}
                  onChange={e => { const opt = fipeModels.find(m => m.code === e.target.value); onModelChange(e.target.value, opt?.name ?? ""); }}
                  disabled={!form.fipeBrandCode || loadingModels}
                  className={inputCls}
                >
                  <option value="">Selecione o modelo</option>
                  {fipeModels.map(m => <option key={m.code} value={m.code}>{toTitleCase(m.name)}</option>)}
                </select>
              </EField>

              <EInput label="Versão" value={form.version} onChange={v => set("version", v)} placeholder={isMoto ? "Ex: CB 500F ABS" : "Ex: LTZ 1.0 Turbo"} />

              {isMoto ? (
                <ESelect label="Tipo de moto" value={form.motoType} onChange={v => set("motoType", v)}>
                  <option value="">Selecione</option>
                  {motoTypeOptions.map(t => <option key={t}>{t}</option>)}
                </ESelect>
              ) : (
                <ESelect label="Carroceria" value={form.bodyType} onChange={v => set("bodyType", v)}>
                  <option value="">Selecione</option>
                  {bodyOptions.map(b => <option key={b}>{b}</option>)}
                </ESelect>
              )}
            </div>
          </Section>

          {/* Condição */}
          <Section title="Condição">
            <div className="flex gap-4">
              {["Novo", "Usado"].map(c => (
                <label key={c} className="flex-1 cursor-pointer">
                  <input type="radio" name="condition" value={c} checked={form.condition === c} onChange={() => set("condition", c)} className="sr-only peer" />
                  <div className="flex items-center justify-center gap-2 border-2 border-black/10 peer-checked:border-primary-container peer-checked:bg-primary-container/10 rounded-xl p-4 transition-all">
                    <Icon name={c === "Novo" ? "new_releases" : isMoto ? "two_wheeler" : "directions_car"} className="text-xl text-gray-700" />
                    <span className="font-bold text-sm text-gray-800">{c}</span>
                  </div>
                </label>
              ))}
            </div>
          </Section>

          {/* Ano & KM */}
          <Section title="Ano & Quilometragem">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <EField label={`Ano${loadingYears ? " (carregando...)" : " *"}`} className="md:col-span-2">
                <select
                  value={form.fipeYearCode}
                  onChange={e => { const opt = fipeYears.find(y => y.code === e.target.value); onYearChange(e.target.value, opt?.name ?? ""); }}
                  disabled={!form.fipeModelCode || loadingYears}
                  className={inputCls}
                >
                  <option value="">Selecione o ano</option>
                  {fipeYears.map(y => <option key={y.code} value={y.code}>{y.name}</option>)}
                </select>
                {form.fuel && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Icon name="local_gas_station" className="text-sm" />Combustível: <strong>{form.fuel}</strong>
                  </p>
                )}
              </EField>
              <EInput label="Quilometragem *" type="number" value={form.km} onChange={v => set("km", v)} placeholder="0" />
            </div>
          </Section>

          {/* Especificações */}
          <Section title="Especificações">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ESelect label="Câmbio *" value={form.transmission} onChange={v => set("transmission", v)}>
                <option value="">Selecione</option>
                {(isMoto ? motoTransmissionOptions : transmissionOptions).map(t => <option key={t}>{t}</option>)}
              </ESelect>
              <ESelect label="Cor" value={form.color} onChange={v => set("color", v)}>
                <option value="">Selecione</option>
                {colorOptions.map(c => <option key={c}>{c}</option>)}
              </ESelect>
              {isMoto ? (
                <EInput label="Cilindrada (cc)" type="number" value={form.cylindercc} onChange={v => set("cylindercc", v)} placeholder="Ex: 500" />
              ) : (
                <ESelect label="Portas" value={form.doors} onChange={v => set("doors", v)}>
                  <option value="">Selecione</option>
                  {["2","3","4","5"].map(n => <option key={n} value={n}>{n} portas</option>)}
                </ESelect>
              )}
            </div>
            <div className="space-y-3 pt-2">
              {[
                { field: "armored", label: isMoto ? "Moto blindada"  : "Veículo blindado" },
                { field: "auction", label: isMoto ? "Moto de leilão" : "Veículo de leilão" },
              ].map(({ field, label }) => (
                <label key={field} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form[field as keyof typeof form] as boolean} onChange={e => set(field, e.target.checked)} className="w-4 h-4 accent-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </label>
              ))}
            </div>
            <EField label="Descrição">
              <textarea
                rows={5}
                value={form.description}
                onChange={e => set("description", e.target.value)}
                placeholder={isMoto ? "Descreva o estado da moto, histórico de manutenção, opcionais..." : "Descreva o estado do veículo, histórico de manutenção, opcionais..."}
                className="w-full border border-black/10 bg-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none resize-none"
              />
            </EField>
          </Section>

          {/* Preço */}
          <Section title="Preço">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <EField label="Valor de venda (R$) *">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-gray-400 pointer-events-none">R$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatBRL(form.price)}
                    onChange={e => set("price", e.target.value.replace(/\D/g, ""))}
                    placeholder="0"
                    className="w-full bg-primary-container/10 border border-primary-container/30 rounded-xl pl-12 pr-4 py-4 text-xl font-black focus:ring-2 focus:ring-primary-container outline-none"
                  />
                </div>
              </EField>
              <div className="flex flex-col gap-3 justify-center">
                {[{ field: "acceptTrade", label: "Aceito troca" }, { field: "financing", label: "Financiamento disponível" }].map(({ field, label }) => (
                  <label key={field} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form[field as keyof typeof form] as boolean} onChange={e => set(field, e.target.checked)} className="w-4 h-4 accent-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </Section>

          {/* Localização */}
          <Section title="Localização">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <EInput label="Cidade" value={form.city} onChange={v => set("city", v)} placeholder="São Paulo" />
              <EInput label="Estado" value={form.state} onChange={v => set("state", v)} placeholder="SP" />
            </div>
          </Section>

          {/* Fotos */}
          <Section title={`Fotos${savingPhotos ? " (salvando...)" : ""}`} badge={`${existingPhotos.length} foto${existingPhotos.length !== 1 ? "s" : ""}`}>
            {existingPhotos.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {existingPhotos.map((photo, i) => (
                  <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    {photo.isCover && (
                      <div className="absolute top-1 left-1 bg-primary-container text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Capa</div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button type="button" onClick={() => movePhoto(i, -1)} disabled={i === 0}
                        className="w-7 h-7 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center disabled:opacity-30 transition-colors">
                        <Icon name="chevron_left" className="text-white text-sm" />
                      </button>
                      <button type="button" onClick={() => deletePhoto(photo.id)}
                        className="w-7 h-7 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors">
                        <Icon name="delete" className="text-white text-sm" />
                      </button>
                      <button type="button" onClick={() => movePhoto(i, 1)} disabled={i === existingPhotos.length - 1}
                        className="w-7 h-7 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center disabled:opacity-30 transition-colors">
                        <Icon name="chevron_right" className="text-white text-sm" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Nenhuma foto cadastrada.</p>
            )}

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-black/10 rounded-xl p-8 cursor-pointer hover:border-primary-container transition-colors">
              <Icon name="add_photo_alternate" className="text-3xl text-gray-300 mb-2" />
              <p className="font-bold text-gray-700 text-sm">Adicionar mais fotos</p>
              <p className="text-xs text-gray-400 mt-0.5">Máx. {20 - existingPhotos.length} foto{20 - existingPhotos.length !== 1 ? "s" : ""} restante{20 - existingPhotos.length !== 1 ? "s" : ""}</p>
              <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only"
                onChange={e => setNewPhotos(prev => [...prev, ...Array.from(e.target.files ?? [])].slice(0, 20 - existingPhotos.length))} />
            </label>

            {newPhotos.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {newPhotos.map((f, i) => (
                  <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setNewPhotos(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Icon name="close" className="text-xs text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Salvar */}
          <div className="flex justify-end pb-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-primary-container text-black px-10 py-3 rounded-xl font-black text-sm hover:opacity-90 transition disabled:opacity-50"
            >
              {saving && <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
              <Icon name="save" className="text-base" />
              Salvar alterações
            </button>
          </div>

        </div>
      )}
    </ErpLayout>
  );
}

/* ── helpers ── */

const inputCls = "w-full border border-black/10 bg-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none disabled:opacity-50";

function Section({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-black/5 pb-4">
        <h2 className="font-black text-gray-900">{title}</h2>
        {badge && <span className="text-xs text-gray-400">{badge}</span>}
      </div>
      {children}
    </div>
  );
}

function EField({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">{label}</label>
      {children}
    </div>
  );
}

function EInput({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <EField label={label}>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />
    </EField>
  );
}

function ESelect({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <EField label={label}>
      <select value={value} onChange={e => onChange(e.target.value)} className={inputCls}>{children}</select>
    </EField>
  );
}
