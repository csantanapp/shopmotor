import { useMemo, useState } from "react";
import {
  X, Check, ChevronRight, ChevronLeft, Car, Settings2, Tag,
  Camera, Rocket, Sparkles, Image as ImageIcon, Trash2, GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Step = 0 | 1 | 2 | 3 | 4;

const steps = [
  { key: 0, label: "Dados", icon: Car },
  { key: 1, label: "Especificações", icon: Settings2 },
  { key: 2, label: "Preço", icon: Tag },
  { key: 3, label: "Fotos", icon: Camera },
  { key: 4, label: "Publicação", icon: Rocket },
] as const;

const FIPE_MOCK = 142000;

export function VehicleWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>(0);
  const [done, setDone] = useState(false);

  // form state
  const [brand, setBrand] = useState("Toyota");
  const [model, setModel] = useState("Corolla");
  const [year, setYear] = useState("2023");
  const [version, setVersion] = useState("XEi 2.0 Flex");
  const [km, setKm] = useState("18000");
  const [transmission, setTransmission] = useState("Automático");
  const [fuel, setFuel] = useState("Flex");
  const [price, setPrice] = useState(141000);
  const [photos, setPhotos] = useState<string[]>([]);
  const [status, setStatus] = useState<"ativo" | "rascunho">("ativo");
  const [boost, setBoost] = useState(true);

  const fipeBadge = useMemo(() => {
    const diff = ((price - FIPE_MOCK) / FIPE_MOCK) * 100;
    if (diff <= -3) return { label: "Abaixo da FIPE — atrai mais leads", tone: "bg-success/15 text-success border-success/30", diff };
    if (diff >= 3) return { label: "Acima da FIPE — pode reduzir interesse", tone: "bg-gold/15 text-gold-deep border-gold/40", diff };
    return { label: "Preço competitivo (na média FIPE)", tone: "bg-info/10 text-info border-info/30", diff };
  }, [price]);

  if (!open) return null;

  const next = () => setStep((s) => Math.min(4, (s + 1)) as Step);
  const prev = () => setStep((s) => Math.max(0, (s - 1)) as Step);

  const onUpload = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setPhotos((p) => [...p, ...urls]);
  };

  const removePhoto = (i: number) => setPhotos((p) => p.filter((_, idx) => idx !== i));
  const movePhoto = (from: number, to: number) => {
    setPhotos((p) => {
      const next = [...p];
      const [it] = next.splice(from, 1);
      next.splice(to, 0, it);
      return next;
    });
  };

  const submit = () => {
    toast.success("Veículo cadastrado com sucesso");
    setDone(true);
  };

  const close = () => {
    setStep(0); setDone(false); setPhotos([]);
    onClose();
  };

  const computedScore = Math.min(
    100,
    50 + Math.min(40, photos.length * 4) + (fipeBadge.diff <= 0 ? 10 : 0) + (boost ? 5 : 0)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-ink/60 backdrop-blur-sm">
      <div className="ml-auto flex h-full w-full max-w-3xl flex-col bg-background shadow-elegant animate-in slide-in-from-right">
        {/* header */}
        <div className="flex items-center justify-between border-b border-border bg-gradient-dark px-6 py-4 text-background">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gold">Cadastro de veículo</p>
            <h2 className="text-lg font-bold">Anuncie e venda mais rápido</h2>
          </div>
          <button onClick={close} className="rounded-lg p-2 text-background/70 hover:bg-background/10 hover:text-background">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!done ? (
          <>
            {/* stepper */}
            <div className="border-b border-border bg-card px-6 py-4">
              <div className="flex items-center justify-between gap-2">
                {steps.map((s, i) => {
                  const Icon = s.icon;
                  const active = step === s.key;
                  const passed = step > s.key;
                  return (
                    <div key={s.key} className="flex flex-1 items-center gap-2">
                      <div className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                        active && "border-gold bg-gradient-gold text-ink shadow-gold",
                        passed && !active && "border-success bg-success text-success-foreground",
                        !active && !passed && "border-border bg-muted text-muted-foreground",
                      )}>
                        {passed ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <span className={cn("hidden md:inline text-xs font-semibold", active ? "text-foreground" : "text-muted-foreground")}>
                        {s.label}
                      </span>
                      {i < steps.length - 1 && <div className={cn("h-px flex-1", passed ? "bg-success" : "bg-border")} />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* body */}
            <div className="flex-1 overflow-y-auto p-6">
              {step === 0 && (
                <div className="space-y-5">
                  <Field label="Marca">
                    <select value={brand} onChange={(e) => setBrand(e.target.value)} className={inputCls}>
                      {["Toyota", "Honda", "Jeep", "VW", "Hyundai", "Fiat", "Chevrolet"].map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </Field>
                  <Field label="Modelo">
                    <input value={model} onChange={(e) => setModel(e.target.value)} className={inputCls} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Ano">
                      <input value={year} onChange={(e) => setYear(e.target.value)} className={inputCls} />
                    </Field>
                    <Field label="Versão">
                      <input value={version} onChange={(e) => setVersion(e.target.value)} className={inputCls} />
                    </Field>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <Field label="Quilometragem">
                    <input value={km} onChange={(e) => setKm(e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Câmbio">
                    <div className="flex gap-2">
                      {["Manual", "Automático", "CVT"].map((t) => (
                        <button key={t} onClick={() => setTransmission(t)} className={chipCls(transmission === t)}>{t}</button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Combustível">
                    <div className="flex flex-wrap gap-2">
                      {["Flex", "Gasolina", "Diesel", "Híbrido", "Elétrico"].map((t) => (
                        <button key={t} onClick={() => setFuel(t)} className={chipCls(fuel === t)}>{t}</button>
                      ))}
                    </div>
                  </Field>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <Field label="Preço de venda (R$)">
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className={inputCls}
                    />
                  </Field>
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">FIPE simulada</p>
                      <p className="text-sm font-bold">R$ {FIPE_MOCK.toLocaleString("pt-BR")}</p>
                    </div>
                    <span className={cn("mt-3 inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider", fipeBadge.tone)}>
                      {fipeBadge.label}
                    </span>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Sugestão do sistema: <span className="font-semibold text-foreground">R$ {Math.round(FIPE_MOCK * 0.985).toLocaleString("pt-BR")}</span> aumenta leads em até 28%.
                    </p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 p-10 text-center cursor-pointer hover:border-gold hover:bg-gold/5 transition">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-semibold">Arraste fotos ou clique para fazer upload</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG · até 10MB cada</p>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => onUpload(e.target.files)} />
                  </label>

                  <div className="rounded-lg border border-gold/30 bg-gold/5 p-3 flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-gold-deep shrink-0 mt-0.5" />
                    <p className="text-xs">
                      <span className="font-bold">10+ fotos aumentam conversão em 35%.</span>{" "}
                      <span className="text-muted-foreground">Você adicionou {photos.length}.</span>
                    </p>
                  </div>

                  {photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {photos.map((src, i) => (
                        <div key={src} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border">
                          <img src={src} alt="" className="h-full w-full object-cover" />
                          {i === 0 && (
                            <span className="absolute left-1.5 top-1.5 rounded-md bg-gradient-gold px-1.5 py-0.5 text-[9px] font-bold uppercase text-ink shadow-gold">
                              Capa
                            </span>
                          )}
                          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-ink/80 px-2 py-1 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => movePhoto(i, Math.max(0, i - 1))} className="text-background">
                              <GripVertical className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => removePhoto(i)} className="text-background hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <p className="text-sm font-semibold">Como deseja publicar?</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setStatus("ativo")}
                      className={cn(
                        "rounded-xl border p-4 text-left transition",
                        status === "ativo" ? "border-gold bg-gold/10 shadow-gold" : "border-border bg-card hover:border-gold/50",
                      )}
                    >
                      <p className="font-bold">Publicar agora</p>
                      <p className="text-xs text-muted-foreground">Disponível imediatamente no marketplace</p>
                    </button>
                    <button
                      onClick={() => setStatus("rascunho")}
                      className={cn(
                        "rounded-xl border p-4 text-left transition",
                        status === "rascunho" ? "border-gold bg-gold/10 shadow-gold" : "border-border bg-card hover:border-gold/50",
                      )}
                    >
                      <p className="font-bold">Salvar como rascunho</p>
                      <p className="text-xs text-muted-foreground">Publica depois quando quiser</p>
                    </button>
                  </div>

                  <label className="flex items-start gap-3 rounded-xl border border-gold/30 bg-gold/5 p-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={boost}
                      onChange={(e) => setBoost(e.target.checked)}
                      className="mt-1 h-4 w-4 accent-[oklch(0.78_0.15_85)]"
                    />
                    <div>
                      <p className="text-sm font-bold flex items-center gap-1.5">
                        <Rocket className="h-4 w-4 text-gold-deep" /> Impulsionar este anúncio
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Anúncios impulsionados recebem em média 4,7x mais leads na 1ª semana.
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* footer */}
            <div className="flex items-center justify-between border-t border-border bg-card px-6 py-4">
              <button
                onClick={prev}
                disabled={step === 0}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold disabled:opacity-40 hover:bg-accent"
              >
                <ChevronLeft className="h-4 w-4" /> Voltar
              </button>
              <p className="text-xs text-muted-foreground">Etapa {step + 1} de {steps.length}</p>
              {step < 4 ? (
                <button onClick={next} className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-background shadow-elegant hover:opacity-90">
                  Próximo <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={submit} className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-gold px-4 py-2 text-sm font-bold text-ink shadow-gold hover:opacity-90">
                  <Check className="h-4 w-4" /> Publicar veículo
                </button>
              )}
            </div>
          </>
        ) : (
          /* post-cadastro */
          <div className="flex-1 overflow-y-auto p-8">
            <div className="mx-auto max-w-md text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-gold shadow-gold">
                <Check className="h-8 w-8 text-ink" />
              </div>
              <h3 className="mt-4 text-xl font-bold">Veja como vender mais rápido</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {brand} {model} {year} foi {status === "ativo" ? "publicado" : "salvo como rascunho"}.
              </p>

              <div className="mt-6 rounded-xl border border-gold/30 bg-gold/5 p-5 text-left">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gold-deep">Score inicial</p>
                  <span className="text-2xl font-bold">{computedScore}<span className="text-xs text-muted-foreground">/100</span></span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-background">
                  <div className="h-full rounded-full bg-gradient-gold" style={{ width: `${computedScore}%` }} />
                </div>
              </div>

              <div className="mt-5 space-y-2 text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sugestões automáticas</p>
                {photos.length < 10 && (
                  <Suggestion icon={Camera} title="Adicione mais fotos" desc={`Você tem ${photos.length}. Anúncios com 10+ convertem 35% mais.`} />
                )}
                {fipeBadge.diff > 0 && (
                  <Suggestion icon={Tag} title="Considere ajustar o preço" desc="Está acima da FIPE — sugerimos R$ 139.870." />
                )}
                {!boost && (
                  <Suggestion icon={Rocket} title="Impulsione para acelerar a venda" desc="Tier Turbo entrega 4x mais visualizações." />
                )}
                <Suggestion icon={Sparkles} title="Sistema vai monitorar 24/7" desc="Você receberá alertas na Central de Oportunidades." />
              </div>

              <button onClick={close} className="mt-6 w-full rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-background shadow-elegant hover:opacity-90">
                Concluir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20";

const chipCls = (active: boolean) =>
  cn(
    "rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
    active ? "border-gold bg-gold/10 text-foreground" : "border-border bg-card text-muted-foreground hover:border-gold/50",
  );

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Suggestion({ icon: Icon, title, desc }: { icon: typeof Camera; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-gold text-ink shadow-gold">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}