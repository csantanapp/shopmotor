"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

// ── Helpers ───────────────────────────────────────────────────────────────────

interface FipeItem { code: string; name: string }

function toTitleCase(s: string) {
  return s.toLowerCase().replace(/(?:^|\s|-)\w/g, c => c.toUpperCase());
}

function formatCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
           .replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3")
           .replace(/(\d{3})(\d{3})/, "$1.$2");
}

function formatCnpj(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
           .replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, "$1.$2.$3/$4")
           .replace(/(\d{2})(\d{3})(\d{3})/, "$1.$2.$3")
           .replace(/(\d{2})(\d{3})/, "$1.$2");
}

function formatPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

function formatCep(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.replace(/(\d{5})(\d{0,3})/, "$1-$2");
}

const CLASSE_BONUS = Array.from({ length: 10 }, (_, i) => String(i + 1));

// ── Componentes base ──────────────────────────────────────────────────────────

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest">{label}</label>
      {children}
      {hint && <p className="text-xs text-on-surface-variant/60">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full border border-outline-variant rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all bg-surface disabled:opacity-50 disabled:cursor-not-allowed";
const selectCls = inputCls;

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full py-3 border-b border-outline-variant/30 last:border-0">
      <span className="text-sm text-on-surface">{label}</span>
      <div className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-primary" : "bg-outline-variant"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </div>
    </button>
  );
}

function TypeBtn({ label, icon, selected, onClick }: { label: string; icon: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-2 py-5 rounded-2xl border-2 font-black text-sm transition-all ${
        selected ? "border-primary bg-primary/5 text-primary" : "border-outline-variant text-on-surface-variant hover:border-outline"
      }`}>
      <Icon name={icon} className="text-3xl" />
      {label}
    </button>
  );
}

function YesNo({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-3">
      {[{ v: false, l: "Não" }, { v: true, l: "Sim" }].map(({ v, l }) => (
        <button key={l} type="button" onClick={() => onChange(v)}
          className={`flex-1 py-3 rounded-xl border-2 text-sm font-black transition-all ${
            value === v ? "border-primary bg-primary/5 text-primary" : "border-outline-variant text-on-surface-variant hover:border-outline"
          }`}>
          {l}
        </button>
      ))}
    </div>
  );
}

// ── Stepper ───────────────────────────────────────────────────────────────────

function Steps({ current }: { current: number }) {
  const steps = ["Veículo", "Uso", "Sobre você"];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((label, i) => {
        const done = i < current, active = i === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all ${
                done ? "bg-primary text-on-primary" : active ? "bg-surface-container ring-4 ring-primary/20 text-on-surface" : "bg-surface-container-low text-on-surface-variant"
              }`}>
                {done ? <Icon name="check" className="text-base" /> : i + 1}
              </div>
              <span className={`text-[11px] mt-1.5 font-black uppercase tracking-wider whitespace-nowrap ${
                active ? "text-on-surface" : done ? "text-primary" : "text-on-surface-variant"
              }`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 md:w-20 h-0.5 mx-1 mb-5 transition-all ${done ? "bg-primary" : "bg-outline-variant"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar() {
  return (
    <div className="hidden lg:block w-72 flex-shrink-0">
      <div className="sticky top-8 bg-surface-container-lowest rounded-3xl border border-outline-variant/40 p-7 shadow-sm">
        <p className="text-xs font-black text-primary uppercase tracking-widest mb-5">Por que ShopMotor Seguros?</p>
        <div className="space-y-4">
          {[
            { icon: "compare_arrows", text: "Compare seguradoras lado a lado"    },
            { icon: "speed",          text: "Processo rápido e 100% online"      },
            { icon: "lock",           text: "Dados protegidos com criptografia"  },
            { icon: "handshake",      text: "Sem compromisso de contratação"     },
            { icon: "star",           text: "Corretoras parceiras certificadas"  },
            { icon: "support_agent",  text: "Consultores especializados"         },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary-container/20 flex items-center justify-center flex-shrink-0">
                <Icon name={item.icon} className="text-primary text-base" />
              </div>
              <p className="text-sm text-on-surface-variant leading-snug">{item.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-7 pt-5 border-t border-outline-variant/40">
          <p className="text-xs text-on-surface-variant/60 leading-relaxed">Simulação gratuita · sem consulta ao SPC/Serasa · sem compromisso</p>
        </div>
      </div>
    </div>
  );
}

// ── Spinner inline ────────────────────────────────────────────────────────────

function Spinner() {
  return <span className="inline-block w-4 h-4 border-2 border-outline-variant border-t-primary rounded-full animate-spin" />;
}

// ── Main ──────────────────────────────────────────────────────────────────────

function SegurosContent() {
  const searchParams  = useSearchParams();
  const storeSlug     = searchParams.get("loja")    ?? undefined;
  const vehicleId     = searchParams.get("veiculo") ?? undefined;

  const [step, setStep]         = useState(0);
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tipoPessoa, setTipoPessoa] = useState<"pf" | "pj">("pf");
  const [faqOpen, setFaqOpen]   = useState<number | null>(null);

  // ── FIPE state ──────────────────────────────────────────────────────────────
  const [tipoVeiculo, setTipoVeiculo] = useState<"carro" | "moto">("carro");
  const fipeType = tipoVeiculo === "moto" ? "MOTO" : "CAR";

  const [fipeBrands,     setFipeBrands]     = useState<FipeItem[]>([]);
  const [fipeModels,     setFipeModels]     = useState<FipeItem[]>([]);
  const [loadingBrands,  setLoadingBrands]  = useState(false);
  const [loadingModels,  setLoadingModels]  = useState(false);

  const [brandCode,  setBrandCode]  = useState("");
  const [marcaNome,  setMarcaNome]  = useState("");
  const [modelCode,  setModelCode]  = useState("");
  const [modeloNome, setModeloNome] = useState("");

  // Carrega marcas quando tipo muda
  useEffect(() => {
    setBrandCode(""); setMarcaNome(""); setModelCode(""); setModeloNome("");
    setFipeBrands([]); setFipeModels([]);
    setLoadingBrands(true);
    fetch(`/api/fipe/brands?vehicleType=${fipeType}`)
      .then(r => r.json())
      .then(d => setFipeBrands(Array.isArray(d) ? d : []))
      .finally(() => setLoadingBrands(false));
  }, [fipeType]);

  async function onBrandChange(code: string, name: string) {
    setBrandCode(code); setMarcaNome(name);
    setModelCode(""); setModeloNome("");
    setFipeModels([]);
    if (!code) return;
    setLoadingModels(true);
    const res  = await fetch(`/api/fipe/brands/${code}/models?vehicleType=${fipeType}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.models ?? []);
    setFipeModels(list.map((m: FipeItem) => ({ ...m, code: String(m.code) })));
    setLoadingModels(false);
  }

  // ── Step 1 ──────────────────────────────────────────────────────────────────
  const [zeroKm,         setZeroKm]         = useState<boolean | null>(null);
  const [placa,          setPlaca]          = useState("");
  const [ano,            setAno]            = useState("");
  const [versao,         setVersao]         = useState("");
  const [usoComercial,   setUsoComercial]   = useState(false);
  const [blindado,       setBlindado]       = useState(false);
  const [kitGas,         setKitGas]         = useState(false);
  const [beneficioFiscal, setBeneficioFiscal] = useState(false);

  const ANOS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() + 1 - i));

  // ── Step 2 ──────────────────────────────────────────────────────────────────
  const [cep,            setCep]            = useState("");
  const [condutorJovem,  setCondutorJovem]  = useState<boolean | null>(null);
  const [possuiSeguro,   setPossuiSeguro]   = useState<boolean | null>(null);
  const [classeBonus,    setClasseBonus]    = useState("");
  const [vencimento,     setVencimento]     = useState("");

  // ── Step 3 ──────────────────────────────────────────────────────────────────
  const [nomeSocial,    setNomeSocial]    = useState("");
  const [nome,          setNome]          = useState("");
  const [cpf,           setCpf]           = useState("");
  const [razaoSocial,   setRazaoSocial]   = useState("");
  const [nomeFantasia,  setNomeFantasia]  = useState("");
  const [cnpj,          setCnpj]          = useState("");
  const [nascimento,    setNascimento]    = useState("");
  const [email,         setEmail]         = useState("");
  const [telefone,      setTelefone]      = useState("");
  const [principalMotorista, setPrincipalMotorista] = useState(true);
  const [termos,        setTermos]        = useState(false);

  // Validações
  const step1Valid = zeroKm !== null && brandCode && modelCode && ano;
  const step2Valid = cep.length >= 9 && condutorJovem !== null && possuiSeguro !== null;
  const step3Valid = tipoPessoa === "pf"
    ? nome.trim() && cpf.length >= 14 && email.includes("@") && telefone.length >= 14 && termos
    : razaoSocial.trim() && cnpj.length >= 18 && email.includes("@") && telefone.length >= 14 && termos;

  // Modal seguro vigente
  useEffect(() => {
    if (vencimento && possuiSeguro) {
      if (new Date(vencimento) > new Date()) setShowModal(true);
    }
  }, [vencimento, possuiSeguro]);

  async function handleSubmit() {
    setLoading(true);
    try {
      await fetch("/api/seguros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoVeiculo, zeroKm, placa: placa || null,
          ano, marca: toTitleCase(marcaNome), modelo: toTitleCase(modeloNome),
          versao: versao || null,
          usoComercial, blindado, kitGas, beneficioFiscal,
          cep, condutorJovem, possuiSeguro,
          classeBonus: classeBonus || null, vencimentoSeguro: vencimento || null,
          tipoPessoa,
          nomeSocial: nomeSocial || null,
          nome: tipoPessoa === "pf" ? nome : razaoSocial,
          cpfCnpj: tipoPessoa === "pf" ? cpf : cnpj,
          razaoSocial: razaoSocial || null, nomeFantasia: nomeFantasia || null,
          nascimento: nascimento || null, email, telefone, principalMotorista,
          storeSlug, vehicleId,
        }),
      });
    } catch {}
    setLoading(false);
    setSubmitted(true);
  }

  // ── Tela de sucesso ─────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-20 h-20 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto">
            <Icon name="verified" className="text-primary text-4xl" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-on-surface mb-3">Solicitação recebida!</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Recebemos sua solicitação. Em breve nossos parceiros entrarão em contato com as melhores opções para seu veículo.
            </p>
          </div>
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/40 p-6 text-left space-y-3 shadow-sm">
            {[
              { icon: "mark_email_read", text: "Confirmação enviada para " + email },
              { icon: "support_agent",   text: "Um consultor especializado entrará em contato em breve." },
              { icon: "compare_arrows",  text: "Você receberá propostas de múltiplas corretoras parceiras." },
              { icon: "task_alt",        text: "Sem compromisso — você decide se quer contratar." },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary-container/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name={item.icon} className="text-primary text-base" />
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed pt-1">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/busca"
              className="flex-1 flex items-center justify-center gap-2 bg-primary-container text-on-primary-container font-black px-6 py-4 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all">
              <Icon name="directions_car" className="text-lg" />
              Ver veículos
            </Link>
            <a href="https://wa.me/5500000000000?text=Olá! Fiz uma simulação de seguro no ShopMotor e gostaria de mais informações."
              target="_blank"
              className="flex-1 flex items-center justify-center gap-2 border-2 border-outline-variant text-on-surface font-black px-6 py-4 rounded-full text-sm uppercase tracking-widest hover:bg-surface-container transition-all">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.558 4.14 1.533 5.874L0 24l6.343-1.516A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.213-3.736.893.953-3.625-.235-.374A9.818 9.818 0 1112 21.818z"/></svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Modal ───────────────────────────────────────────────────────────────────

  const Modal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-surface rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
        <div className="w-14 h-14 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto mb-5">
          <Icon name="info" className="text-primary text-2xl" />
        </div>
        <h3 className="text-xl font-black text-on-surface mb-3">Atenção</h3>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-7">
          Os valores desta simulação servirão apenas como referência. Você poderá renovar o seguro na data correta ou seguir com nova contratação.
        </p>
        <div className="flex gap-3">
          <button onClick={() => { setVencimento(""); setShowModal(false); }}
            className="flex-1 py-3 rounded-full border-2 border-outline-variant text-on-surface font-black text-sm hover:bg-surface-container transition-all">
            Voltar
          </button>
          <button onClick={() => setShowModal(false)}
            className="flex-1 py-3 rounded-full bg-primary-container text-on-primary-container font-black text-sm hover:opacity-90 transition-opacity">
            Continuar
          </button>
        </div>
      </div>
    </div>
  );

  const cardCls = "bg-surface rounded-3xl shadow-sm border border-outline-variant/40 p-8";

  return (
    <div className="min-h-screen bg-surface-container-low">
      {showModal && <Modal />}

      {/* Hero */}
      <div className="text-white py-16 px-4 relative overflow-hidden" style={{ minHeight: 340 }}>
        <div className="absolute inset-0">
          <img src="/images/banner_seguro.webp" alt="" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.25) 100%)" }} />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-container/20 border border-primary-container/30 text-primary-container text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            <Icon name="verified" className="text-sm" /> Simulação gratuita · sem consulta ao SPC
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">Proteja seu veículo<br/>com o melhor seguro</h1>
          <p className="text-neutral-400 max-w-xl mx-auto mb-8 text-sm leading-relaxed">
            Compare seguradoras, receba propostas personalizadas e contrate 100% online. Rápido, gratuito e sem compromisso.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-neutral-400">
            {["Sem compromisso", "Corretoras certificadas", "100% gratuito", "Processo digital"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <Icon name="check_circle" className="text-primary-container text-base" />{t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex gap-10 items-start">
          <div className="flex-1 min-w-0">
            <Steps current={step} />

            {/* ── STEP 1 ── */}
            {step === 0 && (
              <div className={cardCls}>
                <h2 className="text-xl font-black text-on-surface mb-1">Comece sua cotação</h2>
                <p className="text-sm text-on-surface-variant mb-7">Informe os dados do veículo para buscarmos as melhores ofertas.</p>

                <div className="space-y-6">
                  <Field label="Tipo de veículo">
                    <div className="flex gap-3">
                      <TypeBtn label="Carro" icon="directions_car" selected={tipoVeiculo === "carro"} onClick={() => setTipoVeiculo("carro")} />
                      <TypeBtn label="Moto"  icon="two_wheeler"    selected={tipoVeiculo === "moto"}  onClick={() => setTipoVeiculo("moto")}  />
                    </div>
                  </Field>

                  <Field label="Veículo é zero km?">
                    <YesNo value={zeroKm} onChange={setZeroKm} />
                  </Field>

                  <Field label="Placa (opcional)">
                    <input className={inputCls} placeholder="ABC-1234" maxLength={8}
                      value={placa} onChange={e => setPlaca(e.target.value.toUpperCase())} />
                  </Field>

                  {/* Marca FIPE */}
                  <Field label={loadingBrands ? "Carregando marcas..." : "Marca *"}>
                    <div className="relative">
                      <select className={selectCls} value={brandCode}
                        disabled={loadingBrands || fipeBrands.length === 0}
                        onChange={e => {
                          const opt = fipeBrands.find(b => b.code === e.target.value);
                          onBrandChange(e.target.value, opt?.name ?? "");
                        }}>
                        <option value="">{loadingBrands ? "Carregando..." : "Selecione a marca"}</option>
                        {fipeBrands.map(b => (
                          <option key={b.code} value={b.code}>{toTitleCase(b.name)}</option>
                        ))}
                      </select>
                      {loadingBrands && <span className="absolute right-3 top-1/2 -translate-y-1/2"><Spinner /></span>}
                    </div>
                  </Field>

                  {/* Modelo FIPE */}
                  <Field label={loadingModels ? "Carregando modelos..." : "Modelo *"}>
                    <div className="relative">
                      <select className={selectCls} value={modelCode}
                        disabled={!brandCode || loadingModels}
                        onChange={e => {
                          const opt = fipeModels.find(m => m.code === e.target.value);
                          setModelCode(e.target.value);
                          setModeloNome(opt?.name ?? "");
                        }}>
                        <option value="">{!brandCode ? "Selecione a marca primeiro" : loadingModels ? "Carregando..." : "Selecione o modelo"}</option>
                        {fipeModels.map(m => (
                          <option key={m.code} value={m.code}>{toTitleCase(m.name)}</option>
                        ))}
                      </select>
                      {loadingModels && <span className="absolute right-3 top-1/2 -translate-y-1/2"><Spinner /></span>}
                    </div>
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Ano do modelo *">
                      <select className={selectCls} value={ano} onChange={e => setAno(e.target.value)}>
                        <option value="">Selecione</option>
                        {ANOS.map(a => <option key={a}>{a}</option>)}
                      </select>
                    </Field>
                    <Field label="Versão">
                      <input className={inputCls} placeholder="Ex: XEi 2.0" value={versao} onChange={e => setVersao(e.target.value)} />
                    </Field>
                  </div>

                  <div className="border border-outline-variant/40 rounded-2xl p-4">
                    <p className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-3">Detalhes do veículo</p>
                    <Toggle label="Uso comercial?"    checked={usoComercial}    onChange={setUsoComercial}    />
                    <Toggle label="Possui blindagem?" checked={blindado}        onChange={setBlindado}        />
                    <Toggle label="Kit gás?"          checked={kitGas}          onChange={setKitGas}          />
                    <Toggle label="Benefício fiscal?" checked={beneficioFiscal} onChange={setBeneficioFiscal} />
                  </div>
                </div>

                <button onClick={() => setStep(1)} disabled={!step1Valid}
                  className="mt-8 w-full bg-primary-container text-on-primary-container font-black py-4 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  Continuar
                </button>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 1 && (
              <div className={cardCls}>
                <h2 className="text-xl font-black text-on-surface mb-1">Uso do veículo</h2>
                <p className="text-sm text-on-surface-variant mb-7">Essas informações impactam diretamente o valor do seguro.</p>

                <div className="space-y-6">
                  <Field label="CEP onde o veículo pernoita *">
                    <input className={inputCls} placeholder="00000-000" inputMode="numeric"
                      value={cep} onChange={e => setCep(formatCep(e.target.value))} />
                  </Field>

                  <Field label="Algum motorista entre 18 e 25 anos mora com você? *">
                    <YesNo value={condutorJovem} onChange={setCondutorJovem} />
                  </Field>

                  <div className="border border-outline-variant/40 rounded-2xl p-5">
                    <p className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-4">Seguro atual</p>
                    <Field label="Já possui seguro? *">
                      <YesNo value={possuiSeguro} onChange={setPossuiSeguro} />
                    </Field>
                    {possuiSeguro && (
                      <div className="mt-5 space-y-4">
                        <Field label="Classe de bônus">
                          <select className={selectCls} value={classeBonus} onChange={e => setClasseBonus(e.target.value)}>
                            <option value="">Selecione</option>
                            {CLASSE_BONUS.map(c => <option key={c} value={c}>Classe {c}</option>)}
                          </select>
                        </Field>
                        <Field label="Data de vencimento">
                          <input className={inputCls} type="date" value={vencimento} onChange={e => setVencimento(e.target.value)} />
                        </Field>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button onClick={() => setStep(0)}
                    className="px-6 py-4 rounded-full border-2 border-outline-variant text-on-surface font-black text-sm hover:bg-surface-container transition-all">
                    Voltar
                  </button>
                  <button onClick={() => setStep(2)} disabled={!step2Valid}
                    className="flex-1 bg-primary-container text-on-primary-container font-black py-4 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3 ── */}
            {step === 2 && (
              <div className={cardCls}>
                <h2 className="text-xl font-black text-on-surface mb-1">Sobre você</h2>
                <p className="text-sm text-on-surface-variant mb-7">Seus dados são usados apenas para enviar as propostas.</p>

                <div className="flex gap-1 mb-7 bg-surface-container rounded-2xl p-1">
                  {(["pf", "pj"] as const).map(t => (
                    <button key={t} type="button" onClick={() => setTipoPessoa(t)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${
                        tipoPessoa === t ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant hover:text-on-surface"
                      }`}>
                      {t === "pf" ? "Pessoa Física" : "Pessoa Jurídica (CNPJ)"}
                    </button>
                  ))}
                </div>

                <div className="space-y-5">
                  {tipoPessoa === "pf" ? (
                    <>
                      <Field label="Nome social (opcional)">
                        <input className={inputCls} placeholder="Como prefere ser chamado(a)" value={nomeSocial} onChange={e => setNomeSocial(e.target.value)} />
                      </Field>
                      <Field label="Nome completo *">
                        <input className={inputCls} placeholder="Seu nome completo" value={nome} onChange={e => setNome(e.target.value)} />
                      </Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="CPF *">
                          <input className={inputCls} placeholder="000.000.000-00" inputMode="numeric"
                            value={cpf} onChange={e => setCpf(formatCpf(e.target.value))} />
                        </Field>
                        <Field label="Data de nascimento">
                          <input className={inputCls} type="date" value={nascimento} onChange={e => setNascimento(e.target.value)} />
                        </Field>
                      </div>
                    </>
                  ) : (
                    <>
                      <Field label="Razão Social *">
                        <input className={inputCls} placeholder="Razão social da empresa" value={razaoSocial} onChange={e => setRazaoSocial(e.target.value)} />
                      </Field>
                      <Field label="Nome Fantasia">
                        <input className={inputCls} placeholder="Nome fantasia" value={nomeFantasia} onChange={e => setNomeFantasia(e.target.value)} />
                      </Field>
                      <Field label="CNPJ *">
                        <input className={inputCls} placeholder="00.000.000/0000-00" inputMode="numeric"
                          value={cnpj} onChange={e => setCnpj(formatCnpj(e.target.value))} />
                      </Field>
                      <Field label="Contato / Nome">
                        <input className={inputCls} placeholder="Nome do responsável" value={nome} onChange={e => setNome(e.target.value)} />
                      </Field>
                    </>
                  )}

                  <Field label="E-mail *">
                    <input className={inputCls} type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </Field>
                  <Field label="Celular *">
                    <input className={inputCls} placeholder="(00) 00000-0000" inputMode="numeric"
                      value={telefone} onChange={e => setTelefone(formatPhone(e.target.value))} />
                  </Field>

                  <Toggle label="Você é o principal motorista do veículo?" checked={principalMotorista} onChange={setPrincipalMotorista} />

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={termos} onChange={e => setTermos(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-outline-variant accent-primary flex-shrink-0 cursor-pointer" />
                    <span className="text-sm text-on-surface-variant leading-relaxed">
                      Li e concordo com os{" "}
                      <Link href="/termos" className="text-primary font-semibold underline underline-offset-2">Termos de Uso</Link>
                      {" "}e a{" "}
                      <Link href="/privacidade" className="text-primary font-semibold underline underline-offset-2">Política de Privacidade</Link>
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 mt-8">
                  <button onClick={() => setStep(1)}
                    className="px-6 py-4 rounded-full border-2 border-outline-variant text-on-surface font-black text-sm hover:bg-surface-container transition-all">
                    Voltar
                  </button>
                  <button onClick={handleSubmit} disabled={!step3Valid || loading}
                    className="flex-1 bg-primary-container text-on-primary-container font-black py-4 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {loading && <span className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />}
                    Comparar Seguro
                  </button>
                </div>
                <p className="text-center text-xs text-on-surface-variant/60 mt-4">Seus dados são protegidos e tratados conforme a LGPD.</p>
              </div>
            )}
          </div>

          <Sidebar />
        </div>
      </div>

      {/* Seguradoras */}
      <div className="bg-surface border-t border-outline-variant/40 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-6">Trabalhamos com as principais seguradoras</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Porto Seguro", "Allianz", "Bradesco Seguros", "Tokio Marine", "Liberty Seguros", "Zurich"].map(s => (
              <span key={s} className="bg-surface-container-lowest border border-outline-variant/40 text-on-surface-variant text-sm font-bold px-5 py-2.5 rounded-full shadow-sm">{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Vantagens */}
      <div className="bg-surface-container-low border-t border-outline-variant/40 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-on-surface mb-2">Por que cotar pela ShopMotor?</h2>
            <p className="text-on-surface-variant text-sm">Conectamos você às melhores corretoras com um processo simples e seguro.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "compare_arrows", title: "Compare propostas", desc: "Receba ofertas de múltiplas seguradoras e escolha a melhor para você."  },
              { icon: "speed",          title: "Processo rápido",   desc: "Preencha em minutos e receba retorno de um especialista em breve."       },
              { icon: "lock",           title: "Dados protegidos",  desc: "Suas informações são tratadas com total sigilo e segurança (LGPD)."      },
              { icon: "handshake",      title: "Sem compromisso",   desc: "Você recebe as propostas e decide se quer contratar ou não."             },
            ].map(v => (
              <div key={v.title} className="text-center p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm">
                <div className="w-12 h-12 bg-primary-container/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon name={v.icon} className="text-primary text-2xl" />
                </div>
                <h3 className="font-black text-on-surface mb-2">{v.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-surface border-t border-outline-variant/40 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-on-surface mb-2">Perguntas frequentes</h2>
          </div>
          <div className="space-y-3">
            {[
              { q: "A simulação tem algum custo?",            a: "Não. A simulação é totalmente gratuita e sem compromisso de contratação." },
              { q: "A simulação consulta SPC ou Serasa?",     a: "Não. Apenas coletamos seus dados para conectar você com corretoras parceiras. Nenhuma consulta de crédito é realizada." },
              { q: "Quanto tempo para receber as propostas?", a: "Um consultor especializado entrará em contato em até 1 dia útil com as melhores opções para o seu perfil." },
              { q: "Posso cotar para moto também?",           a: "Sim! Nossa simulação atende tanto carros quanto motos." },
              { q: "Meus dados ficam seguros?",               a: "Sim. Todos os dados são tratados conforme a LGPD e utilizados exclusivamente para envio das propostas de seguro." },
              { q: "Posso cancelar meu seguro atual?",        a: "Nossa equipe pode orientar sobre portabilidade ou cancelamento. Fale com um consultor após receber as propostas." },
            ].map((faq, i) => (
              <div key={i} className="border border-outline-variant/40 rounded-2xl overflow-hidden bg-surface-container-lowest">
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-container transition-colors">
                  <span className="font-bold text-on-surface text-sm pr-4">{faq.q}</span>
                  <Icon name={faqOpen === i ? "expand_less" : "expand_more"} className="text-on-surface-variant flex-shrink-0" />
                </button>
                {faqOpen === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-on-surface-variant leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA final */}
      <div className="bg-inverse-surface text-white py-16 px-4 text-center">
        <h2 className="text-3xl font-black mb-3">Pronto para proteger seu veículo?</h2>
        <p className="text-neutral-400 mb-8 max-w-md mx-auto text-sm">Faça sua simulação agora e receba propostas personalizadas sem compromisso.</p>
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="bg-primary-container text-on-primary-container font-black px-10 py-4 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all">
          Simular agora — é grátis
        </button>
      </div>
    </div>
  );
}

export default function SegurosPage() {
  return <Suspense><SegurosContent /></Suspense>;
}
