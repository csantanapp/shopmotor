"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ErpLayout from "@/components/erp/ErpLayout";
import Icon from "@/components/ui/Icon";

/* ─── constants ─────────────────────────────────────────────────────── */
const STEPS = ["Dados básicos", "Especificações", "Preço", "Fotos"];

const fuelOptions         = ["Flex","Gasolina","Etanol","Diesel","Elétrico","Híbrido","GNV"];
const motoFuelOptions     = ["Gasolina","Etanol","Flex","Elétrico"];
const transmissionOptions = ["Automático","Manual","CVT","Automatizado"];
const bodyOptions         = ["Hatch","Sedã","SUV/Crossover","Picape","Minivan","Esportivo","Conversível","Cupê","Van/Utilitário/Furgão","Buggy"];
const plateEndOptions     = ["1 e 2","3 e 4","5 e 6","7 e 8","9 e 0"];
const colorOptions        = ["Branco","Prata","Preto","Cinza","Vermelho","Azul","Verde","Amarelo","Laranja","Marrom","Bege","Dourado","Vinho","Outro"];

const motoStyleOptions  = ["Ciclomotor","Custom","Esportiva","Naked","Off Road","Quadriciclo","Scooter","Street","Supermotard","Touring","Trail","Trial","Triciclo","Utilitária"];
const coolingOptions    = ["Ar","Líquida"];
const startTypeOptions  = ["Elétrica","Pedal","Pedal + Elétrica"];
const engineTypeOptions = ["2 tempos","4 tempos","Elétrico de corrente contínua"];
const gearsOptions      = ["2","3","4","5","6","7","8","Automático"];
const brakeTypeOptions  = ["Disco/Disco","Disco/Tambor","Tambor/Disco","Tambor/Tambor"];
const motoNeedOptions   = ["Esportiva","Estrada","Fora-de-estrada","Lazer","Urbano"];

const FEATURES_CARACTERISTICAS = ["Alienado","Garantia de fábrica","IPVA Pago","Licenciado","Todas revisões feitas pela concessionária","Único dono","Passagem por Leilão"];
const FEATURES_EXTRAS          = ["Ar condicionado","Bancos em couro","Direção hidráulica/elétrica","Piloto automático","Retrovisores elétricos","Travas elétricas","Vidros elétricos"];
const FEATURES_SEGURANCA       = ["Airbag","Controle de tração","Freio ABS","Blindado"];
const FEATURES_TECH            = ["Carplay","Sensor de estacionamento"];
const FEATURES_OUTROS          = ["Faróis de LED/Xenon","Rodas liga leve","Teto solar","Tração 4x4"];
const FEATURES_MOTO            = ["Aceito troca","Alienado","Garantia de fábrica","IPVA Pago","Licenciado","Revisões feitas pela concessionária","Único dono","Passagem por Leilão"];

interface FipeItem { code: string; name: string; }
interface ExistingPhoto { id: string; url: string; order: number; isCover: boolean; }

function toTitleCase(s: string) { return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); }
function fuelFromFipe(n: string) {
  const l = n.toLowerCase();
  if (l.includes("gasolina")) return "Gasolina";
  if (l.includes("álcool") || l.includes("alcool") || l.includes("etanol")) return "Etanol";
  if (l.includes("diesel")) return "Diesel";
  if (l.includes("elétrico") || l.includes("eletrico")) return "Elétrico";
  if (l.includes("flex")) return "Flex";
  if (l.includes("gnv")) return "GNV";
  return "";
}
function formatBRL(raw: string) {
  const d = raw.replace(/\D/g, "");
  return d ? Number(d).toLocaleString("pt-BR") : "";
}
function maskPhoneInline(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
}

/* ─── component ─────────────────────────────────────────────────────── */
export default function EditarVeiculoPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");
  const [step, setStep]               = useState(0);
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
    condition: "Usado", plateEnd: "",
    yearFab: "", yearModel: "", km: "",
    fuel: "", transmission: "", color: "", colorSecondary: "", doors: "",
    cylindercc: "", motoType: "", coolingType: "", startType: "",
    engineType: "", gears: "", brakeType: "", motoNeed: "",
    price: "", acceptTrade: false, financing: false, armored: false, auction: false,
    description: "",
    fipeBrandCode: "", fipeModelCode: "", fipeYearCode: "",
    features: [] as string[],
  });

  const [aquisicao, setAquisicao] = useState({
    proveniencia: "",
    responsavel: "",
    clienteFornecedorId: "",
    valorPago: "",
    valorQuitacao: "",
    valorFinalAquisicao: "",
    valorNotaFiscal: "",
    valorMinimoVenda: "",
    comissaoTipo: "PERCENT",
    comissao: "",
  });
  const [clientes, setClientes] = useState<{ id: string; tipo: string; nome: string; documento: string }[]>([]);
  const [showNovoCliente, setShowNovoCliente] = useState(false);
  const [novoCliente, setNovoCliente] = useState({ tipo: "PF", nome: "", documento: "", telefone: "", email: "", endereco: "", cidade: "", estado: "", cep: "" });
  const [savingCliente, setSavingCliente] = useState(false);

  // Photos
  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>([]);
  const [newPhotos, setNewPhotos]           = useState<File[]>([]);
  const [savingPhotos, setSavingPhotos]     = useState(false);

  /* load vehicle */
  useEffect(() => {
    fetch(`/api/vehicles/${id}`)
      .then(r => r.json())
      .then(async data => {
        const v = data.vehicle;
        if (!v) { router.push("/vendas/veiculos"); return; }
        const type = v.vehicleType ?? "CAR";
        setVehicleType(type);
        setForm({
          brand:          v.brand          ?? "",
          model:          v.model          ?? "",
          version:        v.version        ?? "",
          bodyType:       v.bodyType       ?? "",
          condition:      v.condition === "NEW" ? "Novo" : "Usado",
          plateEnd:       v.plateEnd       ?? "",
          yearFab:        String(v.yearFab   ?? ""),
          yearModel:      String(v.yearModel ?? ""),
          km:             String(v.km        ?? ""),
          fuel:           v.fuel           ?? "",
          transmission:   v.transmission   ?? "",
          color:          v.color          ?? "",
          colorSecondary: v.colorSecondary ?? "",
          doors:          v.doors ? String(v.doors) : "",
          cylindercc:     v.cylindercc ? String(v.cylindercc) : "",
          motoType:       v.motoType       ?? "",
          coolingType:    v.coolingType    ?? "",
          startType:      v.startType      ?? "",
          engineType:     v.engineType     ?? "",
          gears:          v.gears          ?? "",
          brakeType:      v.brakeType      ?? "",
          motoNeed:       v.motoNeed       ?? "",
          price:          String(v.price ?? ""),
          acceptTrade:    v.acceptTrade    ?? false,
          financing:      v.financing      ?? false,
          armored:        v.armored        ?? false,
          auction:        v.auction        ?? false,
          description:    v.description    ?? "",
          fipeBrandCode:  v.fipeBrandCode  ?? "",
          fipeModelCode:  v.fipeModelCode  ?? "",
          fipeYearCode:   v.fipeYearCode   ?? "",
          features:       v.features       ?? [],
        });
        setExistingPhotos([...(v.photos ?? [])].sort((a: ExistingPhoto, b: ExistingPhoto) => a.order - b.order));

        // FIPE cascade
        setLoadingBrands(true);
        const brandsData = await fetch(`/api/fipe/brands?vehicleType=${type}`).then(r => r.json());
        setFipeBrands(Array.isArray(brandsData) ? brandsData : []);
        setLoadingBrands(false);
        if (v.fipeBrandCode) {
          setLoadingModels(true);
          const mData = await fetch(`/api/fipe/brands/${v.fipeBrandCode}/models?vehicleType=${type}`).then(r => r.json());
          const models = Array.isArray(mData) ? mData : (mData.models ?? []);
          setFipeModels(models.map((m: FipeItem) => ({ ...m, code: String(m.code) })));
          setLoadingModels(false);
          if (v.fipeModelCode) {
            setLoadingYears(true);
            const yData = await fetch(`/api/fipe/brands/${v.fipeBrandCode}/models/${v.fipeModelCode}/years?vehicleType=${type}`).then(r => r.json());
            setFipeYears((Array.isArray(yData) ? yData : []).map((y: FipeItem) => ({ ...y, code: String(y.code) })));
            setLoadingYears(false);
          }
        }
        setPageLoading(false);
      })
      .catch(() => router.push("/vendas/veiculos"));
  }, [id, router]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/vehicles/${id}/aquisicao`).then(r => r.json()).then(d => {
      if (d.aquisicao) {
        const a = d.aquisicao;
        setAquisicao({
          proveniencia: a.proveniencia ?? "",
          responsavel: a.responsavel ?? "",
          clienteFornecedorId: a.clienteFornecedorId ?? "",
          valorPago: a.valorPago ? String(a.valorPago) : "",
          valorQuitacao: a.valorQuitacao ? String(a.valorQuitacao) : "",
          valorFinalAquisicao: a.valorFinalAquisicao ? String(a.valorFinalAquisicao) : "",
          valorNotaFiscal: a.valorNotaFiscal ? String(a.valorNotaFiscal) : "",
          valorMinimoVenda: a.valorMinimoVenda ? String(a.valorMinimoVenda) : "",
          comissaoTipo: a.comissaoTipo ?? "PERCENT",
          comissao: a.comissao ? String(a.comissao) : "",
        });
      }
    });
    fetch("/api/perfil/clientes-fornecedores").then(r => r.json()).then(d => setClientes(d.items ?? []));
  }, [id]);

  function set(field: string, value: string | boolean) { setForm(f => ({ ...f, [field]: value })); }
  function toggleFeature(feat: string) {
    setForm(f => ({
      ...f,
      features: f.features.includes(feat) ? f.features.filter(x => x !== feat) : [...f.features, feat],
    }));
  }

  async function onBrandChange(code: string, name: string) {
    setForm(f => ({ ...f, fipeBrandCode: code, brand: toTitleCase(name), fipeModelCode: "", model: "", fipeYearCode: "", yearFab: "", yearModel: "", fuel: "" }));
    setFipeModels([]); setFipeYears([]);
    if (!code) return;
    setLoadingModels(true);
    const data = await fetch(`/api/fipe/brands/${code}/models?vehicleType=${vehicleType}`).then(r => r.json());
    const models = Array.isArray(data) ? data : (data.models ?? []);
    setFipeModels(models.map((m: FipeItem) => ({ ...m, code: String(m.code) })));
    setLoadingModels(false);
  }

  async function onModelChange(code: string, name: string) {
    setForm(f => ({ ...f, fipeModelCode: code, model: toTitleCase(name), fipeYearCode: "", yearFab: "", yearModel: "", fuel: "" }));
    setFipeYears([]);
    if (!code || !form.fipeBrandCode) return;
    setLoadingYears(true);
    const data = await fetch(`/api/fipe/brands/${form.fipeBrandCode}/models/${code}/years?vehicleType=${vehicleType}`).then(r => r.json());
    setFipeYears((Array.isArray(data) ? data : []).map((y: FipeItem) => ({ ...y, code: String(y.code) })));
    setLoadingYears(false);
  }

  function onYearChange(code: string, name: string) {
    setForm(f => ({ ...f, fipeYearCode: code, yearFab: String(parseInt(name)), yearModel: String(parseInt(name)), fuel: fuelFromFipe(name) }));
  }

  async function saveNovoCliente() {
    if (!novoCliente.nome || !novoCliente.documento) return;
    setSavingCliente(true);
    const res = await fetch("/api/perfil/clientes-fornecedores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoCliente),
    });
    const data = await res.json();
    if (data.item) {
      setClientes(prev => [...prev, data.item]);
      setAquisicao(a => ({ ...a, clienteFornecedorId: data.item.id }));
      setShowNovoCliente(false);
      setNovoCliente({ tipo: "PF", nome: "", documento: "", telefone: "", email: "", endereco: "", cidade: "", estado: "", cep: "" });
    }
    setSavingCliente(false);
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
    setExistingPhotos(prev => {
      const next = index + dir;
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

  async function handleNext() {
    setError("");
    if (step === 0 && (!form.fipeBrandCode || !form.fipeModelCode || !form.fipeYearCode || !form.km)) {
      setError("Selecione a marca, modelo, ano e informe a quilometragem."); return;
    }
    if (step === STEPS.length - 1) {
      // save
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
      if (newPhotos.length > 0) {
        const fd = new FormData();
        newPhotos.forEach(f => fd.append("photos", f));
        await fetch(`/api/vehicles/${id}/photos`, { method: "POST", body: fd });
      }
      setSaving(false);
      if (!res.ok) {
        try { const d = await res.json(); setError(d.error ?? "Erro ao salvar."); } catch { setError("Erro ao salvar."); }
        return;
      }
      if (aquisicao.proveniencia) {
        await fetch(`/api/vehicles/${id}/aquisicao`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            proveniencia: aquisicao.proveniencia,
            responsavel: aquisicao.responsavel || null,
            clienteFornecedorId: aquisicao.clienteFornecedorId || null,
            valorPago: aquisicao.valorPago ? Number(aquisicao.valorPago.replace(/\D/g,"")) : null,
            valorQuitacao: aquisicao.valorQuitacao ? Number(aquisicao.valorQuitacao.replace(/\D/g,"")) : null,
            valorFinalAquisicao: (Number(aquisicao.valorPago || 0) + Number(aquisicao.valorQuitacao || 0)) || null,
            valorNotaFiscal: aquisicao.valorNotaFiscal ? Number(aquisicao.valorNotaFiscal.replace(/\D/g,"")) : null,
            valorMinimoVenda: aquisicao.valorMinimoVenda ? Number(aquisicao.valorMinimoVenda.replace(/\D/g,"")) : null,
            comissaoTipo: aquisicao.comissaoTipo || null,
            comissao: aquisicao.comissao ? Number(aquisicao.comissao) : null,
          }),
        });
      }
      router.push("/vendas/veiculos");
      return;
    }
    setStep(s => s + 1);
  }

  const isMoto = vehicleType === "MOTO";

  return (
    <ErpLayout
      title={pageLoading ? "Editar Veículo" : `Editar ${isMoto ? "Moto" : "Carro"}`}
      subtitle="Atualize as informações do seu veículo"
    >
      <div className="mb-6">
        <button onClick={() => router.push("/vendas/veiculos")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition">
          <Icon name="arrow_back" className="text-base" /> Voltar para Veículos
        </button>
      </div>

      {pageLoading ? (
        <div className="flex items-center justify-center py-32">
          <span className="h-8 w-8 rounded-full border-2 border-primary-container/30 border-t-primary-container animate-spin" />
        </div>
      ) : (
        <div className="max-w-3xl space-y-6">

          {/* Steps */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center gap-2 ${i <= step ? "text-gray-900" : "text-gray-400"}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${i < step ? "bg-green-500 text-white" : i === step ? "bg-primary-container text-black" : "bg-gray-100 text-gray-400"}`}>
                    {i < step ? <Icon name="check" className="text-sm" /> : i + 1}
                  </div>
                  <span className="text-xs font-semibold hidden sm:block">{s}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? "bg-green-400" : "bg-black/10"}`} />}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
              <Icon name="error" className="text-lg shrink-0" />{error}
            </div>
          )}

          {/* ── STEP 0: Dados básicos ── */}
          {step === 0 && (
            <div className="space-y-5">
              <Section title="Identificação">
                {!form.fipeBrandCode && (
                  <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm mb-4">
                    <Icon name="info" className="text-yellow-600 shrink-0 mt-0.5" />
                    <p className="text-yellow-800">Selecione a marca, modelo e ano pela <strong>Tabela FIPE</strong> para exibir o valor FIPE no anúncio.</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <EField label={`Marca${loadingBrands ? " (carregando...)" : " *"}`}>
                    <select value={form.fipeBrandCode} disabled={loadingBrands} className={iCls}
                      onChange={e => { const o = fipeBrands.find(b => b.code === e.target.value); onBrandChange(e.target.value, o?.name ?? ""); }}>
                      <option value="">Selecione a marca</option>
                      {fipeBrands.map(b => <option key={b.code} value={b.code}>{toTitleCase(b.name)}</option>)}
                    </select>
                  </EField>
                  <EField label={`Modelo${loadingModels ? " (carregando...)" : " *"}`}>
                    <select value={form.fipeModelCode} disabled={!form.fipeBrandCode || loadingModels} className={iCls}
                      onChange={e => { const o = fipeModels.find(m => m.code === e.target.value); onModelChange(e.target.value, o?.name ?? ""); }}>
                      <option value="">Selecione o modelo</option>
                      {fipeModels.map(m => <option key={m.code} value={m.code}>{toTitleCase(m.name)}</option>)}
                    </select>
                  </EField>
                  <EInput label="Versão" value={form.version} onChange={v => set("version", v)} placeholder={isMoto ? "Ex: CB 500F ABS" : "Ex: LTZ 1.0 Turbo Premier"} />
                  {!isMoto && (
                    <ESelect label="Carroceria" value={form.bodyType} onChange={v => set("bodyType", v)}>
                      <option value="">Selecione</option>
                      {bodyOptions.map(b => <option key={b}>{b}</option>)}
                    </ESelect>
                  )}
                </div>
              </Section>

              {!isMoto && (
                <Section title="Final da placa">
                  <div className="flex flex-wrap gap-2">
                    {plateEndOptions.map(opt => (
                      <button key={opt} type="button" onClick={() => set("plateEnd", form.plateEnd === opt ? "" : opt)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${form.plateEnd === opt ? "border-primary-container bg-primary-container/10 text-gray-900" : "border-black/10 text-gray-500 hover:border-gray-300"}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </Section>
              )}

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

              <Section title="Ano & Quilometragem">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <EField label={`Ano${loadingYears ? " (carregando...)" : " *"}`} className="md:col-span-2">
                    <select value={form.fipeYearCode} disabled={!form.fipeModelCode || loadingYears} className={iCls}
                      onChange={e => { const o = fipeYears.find(y => y.code === e.target.value); onYearChange(e.target.value, o?.name ?? ""); }}>
                      <option value="">Selecione o ano</option>
                      {fipeYears.map(y => <option key={y.code} value={y.code}>{y.name}</option>)}
                    </select>
                    {form.fuel && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Icon name="local_gas_station" className="text-sm" /> Combustível: <strong>{form.fuel}</strong>
                      </p>
                    )}
                  </EField>
                  <EInput label="Quilometragem *" type="number" value={form.km} onChange={v => set("km", v)} placeholder="0" />
                </div>
              </Section>
            </div>
          )}

          {/* ── STEP 1: Especificações ── */}
          {step === 1 && (
            <div className="space-y-5">
              <Section title="Especificações">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <ESelect label="Combustível *" value={form.fuel} onChange={v => set("fuel", v)}>
                    <option value="">Selecione</option>
                    {(isMoto ? motoFuelOptions : fuelOptions).map(o => <option key={o}>{o}</option>)}
                  </ESelect>
                  {isMoto ? (
                    <ESelect label="Tipo de motor" value={form.engineType} onChange={v => set("engineType", v)}>
                      <option value="">Selecione</option>
                      {engineTypeOptions.map(o => <option key={o}>{o}</option>)}
                    </ESelect>
                  ) : (
                    <ESelect label="Câmbio *" value={form.transmission} onChange={v => set("transmission", v)}>
                      <option value="">Selecione</option>
                      {transmissionOptions.map(t => <option key={t}>{t}</option>)}
                    </ESelect>
                  )}
                  <ESelect label="Cor primária" value={form.color} onChange={v => set("color", v)}>
                    <option value="">Selecione</option>
                    {colorOptions.map(c => <option key={c}>{c}</option>)}
                  </ESelect>
                  {isMoto ? (
                    <ESelect label="Cor secundária" value={form.colorSecondary} onChange={v => set("colorSecondary", v)}>
                      <option value="">Selecione</option>
                      {colorOptions.map(c => <option key={c}>{c}</option>)}
                    </ESelect>
                  ) : (
                    <ESelect label="Portas" value={form.doors} onChange={v => set("doors", v)}>
                      <option value="">Selecione</option>
                      {["2","3","4","5"].map(n => <option key={n} value={n}>{n} portas</option>)}
                    </ESelect>
                  )}
                  {isMoto && (
                    <>
                      <EInput label="Cilindrada (cc)" type="number" value={form.cylindercc} onChange={v => set("cylindercc", v)} placeholder="Ex: 500" />
                      <ESelect label="Número de marchas" value={form.gears} onChange={v => set("gears", v)}>
                        <option value="">Selecione</option>
                        {gearsOptions.map(g => <option key={g}>{g}</option>)}
                      </ESelect>
                      <ESelect label="Tipo de refrigeração" value={form.coolingType} onChange={v => set("coolingType", v)}>
                        <option value="">Selecione</option>
                        {coolingOptions.map(o => <option key={o}>{o}</option>)}
                      </ESelect>
                      <ESelect label="Tipo de partida" value={form.startType} onChange={v => set("startType", v)}>
                        <option value="">Selecione</option>
                        {startTypeOptions.map(o => <option key={o}>{o}</option>)}
                      </ESelect>
                      <ESelect label="Freio dianteiro/traseiro" value={form.brakeType} onChange={v => set("brakeType", v)}>
                        <option value="">Selecione</option>
                        {brakeTypeOptions.map(o => <option key={o}>{o}</option>)}
                      </ESelect>
                      <ESelect label="Estilo" value={form.motoType} onChange={v => set("motoType", v)}>
                        <option value="">Selecione</option>
                        {motoStyleOptions.map(o => <option key={o}>{o}</option>)}
                      </ESelect>
                      <ESelect label="Necessidade" value={form.motoNeed} onChange={v => set("motoNeed", v)}>
                        <option value="">Selecione</option>
                        {motoNeedOptions.map(o => <option key={o}>{o}</option>)}
                      </ESelect>
                    </>
                  )}
                </div>
              </Section>

              {!isMoto ? (
                <>
                  <FeatureBlock title="Características"               features={FEATURES_CARACTERISTICAS} selected={form.features} onToggle={toggleFeature} />
                  <FeatureBlock title="Extras do Veículo"             features={FEATURES_EXTRAS}          selected={form.features} onToggle={toggleFeature} />
                  <FeatureBlock title="Segurança"                     features={FEATURES_SEGURANCA}       selected={form.features} onToggle={toggleFeature} />
                  <FeatureBlock title="Tecnologia e Conectividade"    features={FEATURES_TECH}            selected={form.features} onToggle={toggleFeature} />
                  <FeatureBlock title="Outros"                        features={FEATURES_OUTROS}          selected={form.features} onToggle={toggleFeature} />
                </>
              ) : (
                <FeatureBlock title="Características" features={FEATURES_MOTO} selected={form.features} onToggle={toggleFeature} />
              )}

              <Section title="Descrição">
                <textarea rows={5} value={form.description} onChange={e => set("description", e.target.value)}
                  placeholder={isMoto ? "Descreva o estado da moto, histórico de manutenção, opcionais..." : "Descreva o estado do veículo, histórico de manutenção, opcionais..."}
                  className="w-full border border-black/10 bg-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none resize-none" />
              </Section>
            </div>
          )}

          {/* ── STEP 2: Preço ── */}
          {step === 2 && (
            <div className="space-y-5">
            <Section title="Preço">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <EField label="Valor de venda (R$) *">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-gray-400 pointer-events-none">R$</span>
                    <input type="text" inputMode="numeric"
                      value={formatBRL(form.price)}
                      onChange={e => set("price", e.target.value.replace(/\D/g, ""))}
                      placeholder="0"
                      className="w-full bg-primary-container/10 border border-primary-container/30 rounded-xl pl-12 pr-4 py-4 text-xl font-black focus:ring-2 focus:ring-primary-container outline-none" />
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

            {/* AQUISIÇÃO */}
            <Section title="Aquisição">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <EField label="Proveniência" className="md:col-span-2">
                  <div className="flex gap-3">
                    {["COMPRA","TROCA","CONSIGNADO"].map(opt => (
                      <label key={opt} className="flex-1 cursor-pointer">
                        <input type="radio" name="proveniencia" value={opt}
                          checked={aquisicao.proveniencia === opt}
                          onChange={() => setAquisicao(a => ({ ...a, proveniencia: opt }))}
                          className="sr-only peer" />
                        <div className="flex items-center justify-center border-2 border-black/10 peer-checked:border-primary-container peer-checked:bg-primary-container/10 rounded-xl p-3 text-sm font-bold text-gray-700 transition-all cursor-pointer">
                          {opt.charAt(0) + opt.slice(1).toLowerCase()}
                        </div>
                      </label>
                    ))}
                  </div>
                </EField>

                {(aquisicao.proveniencia === "COMPRA" || aquisicao.proveniencia === "TROCA") && (
                  <>
                    <EField label="Valor pago no veículo (R$)">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
                        <input type="text" inputMode="numeric"
                          value={formatBRL(aquisicao.valorPago)}
                          onChange={e => setAquisicao(a => ({ ...a, valorPago: e.target.value.replace(/\D/g,"") }))}
                          className={`${iCls} pl-9`} placeholder="0" />
                      </div>
                    </EField>
                    <EField label="Valor de quitação (R$)">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
                        <input type="text" inputMode="numeric"
                          value={formatBRL(aquisicao.valorQuitacao)}
                          onChange={e => setAquisicao(a => ({ ...a, valorQuitacao: e.target.value.replace(/\D/g,"") }))}
                          className={`${iCls} pl-9`} placeholder="0" />
                      </div>
                    </EField>
                    <EField label="Valor final de aquisição (R$)">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
                        <input type="text" readOnly
                          value={formatBRL(String((Number(aquisicao.valorPago || 0) + Number(aquisicao.valorQuitacao || 0)) || ""))}
                          className={`${iCls} pl-9 bg-gray-50 text-gray-500 cursor-default`} placeholder="0" />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">Calculado automaticamente: Valor pago + Valor de quitação</p>
                    </EField>
                    <EField label="Responsável pela aquisição">
                      <input type="text" value={aquisicao.responsavel}
                        onChange={e => setAquisicao(a => ({ ...a, responsavel: e.target.value }))}
                        className={iCls} placeholder="Nome do responsável" />
                    </EField>
                  </>
                )}

                {aquisicao.proveniencia === "CONSIGNADO" && (
                  <>
                    <EField label="Valor do veículo na Nota Fiscal (R$)">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
                        <input type="text" inputMode="numeric"
                          value={formatBRL(aquisicao.valorNotaFiscal)}
                          onChange={e => setAquisicao(a => ({ ...a, valorNotaFiscal: e.target.value.replace(/\D/g,"") }))}
                          className={`${iCls} pl-9`} placeholder="0" />
                      </div>
                    </EField>
                    <EField label="Valor mínimo de venda (R$)">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
                        <input type="text" inputMode="numeric"
                          value={formatBRL(aquisicao.valorMinimoVenda)}
                          onChange={e => setAquisicao(a => ({ ...a, valorMinimoVenda: e.target.value.replace(/\D/g,"") }))}
                          className={`${iCls} pl-9`} placeholder="0" />
                      </div>
                    </EField>
                    <EField label="Tipo de comissão">
                      <div className="flex gap-3">
                        {[{ v: "PERCENT", l: "% Percentual" }, { v: "FIXO", l: "R$ Fixo" }].map(({ v, l }) => (
                          <label key={v} className="flex-1 cursor-pointer">
                            <input type="radio" checked={aquisicao.comissaoTipo === v}
                              onChange={() => setAquisicao(a => ({ ...a, comissaoTipo: v }))}
                              className="sr-only peer" />
                            <div className="flex items-center justify-center border-2 border-black/10 peer-checked:border-primary-container peer-checked:bg-primary-container/10 rounded-xl p-3 text-sm font-bold text-gray-700 transition-all cursor-pointer">{l}</div>
                          </label>
                        ))}
                      </div>
                    </EField>
                    <EField label={`Comissão (${aquisicao.comissaoTipo === "PERCENT" ? "%" : "R$"})`}>
                      <input type="number" value={aquisicao.comissao}
                        onChange={e => setAquisicao(a => ({ ...a, comissao: e.target.value }))}
                        className={iCls} placeholder={aquisicao.comissaoTipo === "PERCENT" ? "Ex: 5" : "Ex: 1500"} />
                    </EField>
                    <EField label="Responsável pela aquisição">
                      <input type="text" value={aquisicao.responsavel}
                        onChange={e => setAquisicao(a => ({ ...a, responsavel: e.target.value }))}
                        className={iCls} placeholder="Nome do responsável" />
                    </EField>
                  </>
                )}

                {aquisicao.proveniencia && (
                  <EField label="Cliente / Fornecedor" className="md:col-span-2">
                    <div className="flex gap-2">
                      <select value={aquisicao.clienteFornecedorId}
                        onChange={e => setAquisicao(a => ({ ...a, clienteFornecedorId: e.target.value }))}
                        className={`${iCls} flex-1`}>
                        <option value="">Selecione ou cadastre</option>
                        {clientes.map(c => (
                          <option key={c.id} value={c.id}>{c.nome} ({c.tipo === "PF" ? "CPF" : "CNPJ"}: {c.documento})</option>
                        ))}
                      </select>
                      <button type="button" onClick={() => setShowNovoCliente(true)}
                        className="shrink-0 rounded-xl border border-black/10 px-4 text-sm font-black text-gray-600 hover:bg-gray-50 transition whitespace-nowrap">
                        + Novo
                      </button>
                    </div>
                  </EField>
                )}
              </div>

              {/* Modal novo cliente */}
              {showNovoCliente && (
                <div className="mt-5 rounded-xl border border-primary-container/40 bg-yellow-50 p-5 space-y-4">
                  <p className="font-black text-gray-900 text-sm">Cadastrar Cliente / Fornecedor</p>
                  <div className="flex gap-4">
                    {[{ v: "PF", l: "Pessoa Física" }, { v: "PJ", l: "Pessoa Jurídica" }].map(({ v, l }) => (
                      <label key={v} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={novoCliente.tipo === v}
                          onChange={() => setNovoCliente(n => ({ ...n, tipo: v, documento: "" }))}
                          className="w-4 h-4 accent-yellow-500" />
                        <span className="text-sm font-medium text-gray-700">{l}</span>
                      </label>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EField label="Nome *" className="md:col-span-2">
                      <input type="text" value={novoCliente.nome}
                        onChange={e => setNovoCliente(n => ({ ...n, nome: e.target.value }))}
                        className={iCls} placeholder="Nome completo" />
                    </EField>
                    <EField label={novoCliente.tipo === "PF" ? "CPF *" : "CNPJ *"}>
                      <input type="text" value={novoCliente.documento}
                        onChange={e => setNovoCliente(n => ({ ...n, documento: e.target.value }))}
                        className={iCls} placeholder={novoCliente.tipo === "PF" ? "000.000.000-00" : "00.000.000/0000-00"} />
                    </EField>
                    <EField label="Telefone">
                      <input type="tel" value={novoCliente.telefone}
                        onChange={e => setNovoCliente(n => ({ ...n, telefone: maskPhoneInline(e.target.value) }))}
                        className={iCls} placeholder="(00) 00000-0000" maxLength={15} />
                    </EField>
                    <EField label="E-mail" className="md:col-span-2">
                      <input type="email" value={novoCliente.email}
                        onChange={e => setNovoCliente(n => ({ ...n, email: e.target.value }))}
                        className={iCls} placeholder="email@exemplo.com" />
                    </EField>
                    <EField label="Endereço" className="md:col-span-2">
                      <input type="text" value={novoCliente.endereco}
                        onChange={e => setNovoCliente(n => ({ ...n, endereco: e.target.value }))}
                        className={iCls} placeholder="Rua, número, complemento" />
                    </EField>
                    <EField label="Cidade">
                      <input type="text" value={novoCliente.cidade}
                        onChange={e => setNovoCliente(n => ({ ...n, cidade: e.target.value }))}
                        className={iCls} placeholder="São Paulo" />
                    </EField>
                    <EField label="Estado">
                      <input type="text" value={novoCliente.estado}
                        onChange={e => setNovoCliente(n => ({ ...n, estado: e.target.value.toUpperCase().slice(0, 2) }))}
                        className={iCls} placeholder="SP" maxLength={2} />
                    </EField>
                    <EField label="CEP">
                      <input type="text" value={novoCliente.cep}
                        onChange={e => setNovoCliente(n => ({ ...n, cep: e.target.value.replace(/\D/g,"").replace(/(\d{5})(\d{0,3})/,"$1-$2").slice(0,9) }))}
                        className={iCls} placeholder="00000-000" />
                    </EField>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={saveNovoCliente} disabled={savingCliente}
                      className="flex items-center gap-2 bg-primary-container text-black px-6 py-2 rounded-xl text-sm font-black hover:opacity-90 disabled:opacity-50">
                      {savingCliente && <span className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
                      Salvar
                    </button>
                    <button type="button" onClick={() => setShowNovoCliente(false)}
                      className="px-6 py-2 rounded-xl border border-black/10 text-sm text-gray-500 hover:bg-gray-50">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </Section>
            </div>
          )}

          {/* ── STEP 3: Fotos ── */}
          {step === 3 && (
            <Section title="Fotos" badge={savingPhotos ? "salvando..." : `${existingPhotos.length + newPhotos.length} foto${existingPhotos.length + newPhotos.length !== 1 ? "s" : ""}`}>
              <p className="text-xs text-gray-400 -mt-2">Mínimo 1 foto · Máximo 20 · JPG, PNG ou WebP · Até 10MB cada</p>

              {/* existing */}
              {existingPhotos.length > 0 && (
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
              )}

              {/* new photos preview */}
              {newPhotos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {newPhotos.map((f, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                      <div className="absolute top-1 left-1 bg-blue-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Nova</div>
                      <button type="button" onClick={() => setNewPhotos(prev => prev.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Icon name="close" className="text-xs text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* upload area */}
              {existingPhotos.length + newPhotos.length < 20 && (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-black/10 rounded-xl p-10 cursor-pointer hover:border-primary-container transition-colors">
                  <Icon name="add_photo_alternate" className="text-4xl text-gray-300 mb-2" />
                  <p className="font-bold text-gray-700 text-sm">Clique para adicionar fotos</p>
                  <p className="text-xs text-gray-400 mt-0.5">A primeira foto será a capa do anúncio</p>
                  <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only"
                    onChange={e => setNewPhotos(prev => [...prev, ...Array.from(e.target.files ?? [])].slice(0, 20 - existingPhotos.length))} />
                </label>
              )}
            </Section>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pb-8">
            {step > 0 ? (
              <button type="button" onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-500 border border-black/10 hover:bg-gray-50 transition">
                <Icon name="arrow_back" className="text-sm" /> Voltar
              </button>
            ) : <div />}
            <button type="button" onClick={handleNext} disabled={saving}
              className="flex items-center gap-2 bg-primary-container text-black px-10 py-3 rounded-xl font-black text-sm hover:opacity-90 transition disabled:opacity-50">
              {saving && <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
              {step === STEPS.length - 1 ? (
                <><Icon name="save" className="text-base" /> Salvar alterações</>
              ) : (
                <>Próximo <Icon name="arrow_forward" className="text-sm" /></>
              )}
            </button>
          </div>

        </div>
      )}
    </ErpLayout>
  );
}

/* ─── shared helpers ─────────────────────────────────────────────────── */
const iCls = "w-full border border-black/10 bg-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none disabled:opacity-50";

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
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={iCls} />
    </EField>
  );
}

function ESelect({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <EField label={label}>
      <select value={value} onChange={e => onChange(e.target.value)} className={iCls}>{children}</select>
    </EField>
  );
}

function FeatureBlock({ title, features, selected, onToggle }: { title: string; features: string[]; selected: string[]; onToggle: (f: string) => void }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm space-y-4">
      <h2 className="font-black text-gray-900 border-b border-black/5 pb-4">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {features.map(feat => (
          <label key={feat} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={selected.includes(feat)} onChange={() => onToggle(feat)} className="w-4 h-4 accent-yellow-500" />
            <span className="text-sm text-gray-700">{feat}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
