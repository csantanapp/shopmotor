"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Icon from "@/components/ui/Icon";

// ── Config ────────────────────────────────────────────────────────────────────
const TAXA_MENSAL = 0.0179;
const PARCELAS_OPCOES = [12, 24, 36, 48, 60];

function calcPMT(pv: number, i: number, n: number) {
  if (pv <= 0 || n <= 0) return 0;
  if (i === 0) return pv / n;
  return (pv * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
}
function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}
function fmtInput(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (!d) return "";
  return (Number(d) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}
function parseVal(s: string) {
  return parseFloat(s.replace(/\./g, "").replace(",", ".")) || 0;
}
function formatCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
          .replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3")
          .replace(/(\d{3})(\d{3})/, "$1.$2");
}
function formatPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

// ── Steps ─────────────────────────────────────────────────────────────────────
function Steps({ current }: { current: number }) {
  const steps = ["Veículo", "Dados pessoais", "Resultado"];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all
                ${done ? "bg-yellow-500 text-black" : active ? "bg-zinc-900 text-white ring-4 ring-yellow-400/30" : "bg-zinc-100 text-zinc-400"}`}>
                {done ? <Icon name="check" className="text-base" /> : i + 1}
              </div>
              <span className={`text-[11px] mt-1.5 font-bold uppercase tracking-wider whitespace-nowrap
                ${active ? "text-zinc-900" : done ? "text-yellow-600" : "text-zinc-400"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 md:w-20 h-0.5 mx-1 mb-5 transition-all ${done ? "bg-yellow-500" : "bg-zinc-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">{label}</label>
      {children}
      {hint && <p className="text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/20 transition-all bg-white";

// ── Dados estáticos ───────────────────────────────────────────────────────────
const VANTAGENS = [
  {
    icon: "speed",
    title: "Aprovação rápida",
    desc: "Análise em até 24h com retorno pelo WhatsApp.",
    img: "/images/aprovacao.webp",
  },
  {
    icon: "percent",
    title: "Taxas competitivas",
    desc: "Trabalhamos com as melhores financeiras do país.",
    img: "/images/taxas.webp",
  },
  {
    icon: "shield",
    title: "Dados protegidos",
    desc: "Suas informações são tratadas com total sigilo e segurança.",
    img: "/images/dados-protegidos.webp",
  },
  {
    icon: "support_agent",
    title: "Consultoria gratuita",
    desc: "Especialistas disponíveis para tirar todas as suas dúvidas.",
    img: "/images/consultora_gratuita.webp",
  },
];

const FINANCEIRAS = [
  { name: "Banco do Brasil",         bg: "#F9D72F", color: "#003882", abbr: "BB"  },
  { name: "Bradesco",                bg: "#CC0000", color: "#fff",    abbr: "BD"  },
  { name: "Santander Auto",          bg: "#EC0000", color: "#fff",    abbr: "SAN" },
  { name: "Itaú Unibanco",           bg: "#EC7000", color: "#fff",    abbr: "ITÁ" },
  { name: "BV Financeira",           bg: "#1A237E", color: "#fff",    abbr: "BV"  },
  { name: "Caixa Econômica",         bg: "#005CA9", color: "#fff",    abbr: "CEF" },
];

const FAQS_FIN = [
  { q: "Quem pode fazer a simulação?", a: "Qualquer pessoa maior de 18 anos com CPF válido pode simular. A aprovação final depende da análise de crédito da financeira parceira." },
  { q: "A simulação compromete meu crédito?", a: "Não. A simulação é apenas estimada e não realiza consulta ao SPC/Serasa. A análise real só ocorre quando você der andamento ao processo." },
  { q: "Quanto tempo leva a aprovação?", a: "Após o envio da documentação completa, a análise costuma ser concluída em até 1 dia útil." },
  { q: "Quais documentos são necessários?", a: "RG/CNH, CPF, comprovante de renda (holerite ou declaração IR) e comprovante de residência atualizado." },
  { q: "Posso financiar 100% do veículo?", a: "Em geral as financeiras financiam até 80-90% do valor do veículo. Uma entrada mínima facilita a aprovação e reduz o valor das parcelas." },
  { q: "A taxa de juros pode mudar?", a: "Sim. A taxa da simulação é estimada com base nas médias de mercado. A taxa final é definida pela financeira após análise de crédito." },
];

// ── Page ──────────────────────────────────────────────────────────────────────
function FinanciamentoContent() {
  const searchParams = useSearchParams();
  const storeSlug = searchParams.get("loja") ?? undefined;
  const vehicleId = searchParams.get("veiculo") ?? undefined;

  const [step, setStep]       = useState(0);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // Step 1
  const [valorCarro, setValorCarro] = useState("");
  const [parcelas, setParcelas]     = useState<number>(48);
  const [entrada, setEntrada]       = useState("");

  // Step 2
  const [nome, setNome]           = useState("");
  const [cpf, setCpf]             = useState("");
  const [nascimento, setNascimento] = useState("");
  const [email, setEmail]         = useState("");
  const [cidade, setCidade]       = useState("");
  const [whatsapp, setWhatsapp]   = useState("");
  const [prazo, setPrazo]         = useState("");
  const [loading, setLoading]     = useState(false);

  const veiculo    = parseVal(valorCarro);
  const entradaVal = parseVal(entrada);
  const financiado = Math.max(veiculo - entradaVal, 0);
  const pmt        = calcPMT(financiado, TAXA_MENSAL, parcelas);
  const totalPago  = pmt * parcelas;
  const jurosTotal = totalPago - financiado;

  const step1Valid = veiculo >= 5000 && parcelas > 0 && entradaVal >= 0 && entradaVal < veiculo;
  const step2Valid = nome.trim() && cpf.length >= 14 && nascimento && email.includes("@") && cidade.trim() && whatsapp.length >= 14 && prazo;

  async function handleSubmit() {
    setLoading(true);
    try {
      await fetch("/api/financiamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, cpf, nascimento, email, cidade, whatsapp, prazo, valorCarro: veiculo, entrada: entradaVal, parcelas, financiado, pmt, storeSlug, vehicleId }),
      });
    } catch {}
    setLoading(false);
    setStep(2);
  }

  function resetForm() {
    setStep(0); setValorCarro(""); setEntrada(""); setParcelas(48);
    setNome(""); setCpf(""); setNascimento(""); setEmail(""); setCidade(""); setWhatsapp(""); setPrazo("");
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', sans-serif", background: "#f5f5f5" }}>

      {/* ════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: 480 }}>

        {/* Banner de fundo */}
        <div className="absolute inset-0">
          <img
            src="/images/banner_financiamento.webp"
            alt=""
            className="w-full h-full object-cover object-center"
          />
          {/* Overlay escuro para legibilidade */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.2) 100%)" }} />
        </div>

        {/* Glow dourado inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 35% 120%, rgba(234,179,8,0.18) 0%, transparent 70%)" }} />

        {/* Linha dourada superior */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(234,179,8,0.5), transparent)" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 lg:py-20 flex flex-col items-start gap-8">

          {/* Texto */}
          <div className="text-white max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest"
              style={{ background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.3)", color: "#EAB308" }}>
              <Icon name="verified" className="text-sm" />
              Simulação gratuita · Sem consulta ao SPC
            </div>

            <h1 className="font-black leading-[1.05] tracking-tight mb-5" style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)" }}>
              Financie seu veículo<br />
              com as <span style={{ color: "#EAB308" }}>melhores taxas</span>
            </h1>

            <p className="mb-8 leading-relaxed" style={{ color: "#d1d5db", maxWidth: 480, fontSize: 15 }}>
              Simule agora em segundos e receba o contato de um especialista com as condições personalizadas para o seu perfil.
            </p>

            {/* Benefits grid */}
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              {[
                { icon: "check_circle", label: "Sem compromisso" },
                { icon: "schedule",     label: "Análise em 24h" },
                { icon: "favorite",     label: "100% gratuito" },
                { icon: "account_balance", label: "Mais de 6 financeiras" },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-2">
                  <Icon name={b.icon} className="text-base flex-shrink-0 text-yellow-400" />
                  <span className="text-sm font-medium" style={{ color: "#d1d5db" }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Linha decorativa inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(234,179,8,0.3), transparent)" }} />
      </section>

      {/* ════════════════════════════════════════════
          SIMULADOR
      ════════════════════════════════════════════ */}
      <section style={{ background: "#f5f5f5", padding: "56px 16px" }}>
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8 items-start">

          {/* Formulário */}
          <div className="flex-1 min-w-0">
            <Steps current={step} />

            {/* STEP 1 */}
            {step === 0 && (
              <div className="bg-white rounded-3xl p-8" style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>
                <h2 className="text-xl font-black text-zinc-900 mb-1">Dados do veículo</h2>
                <p className="text-sm text-zinc-400 mb-7">Informe o valor do veículo, entrada e prazo desejado.</p>

                <div className="space-y-6">
                  <Field label="Valor do veículo">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">R$</span>
                      <input className={`${inputCls} pl-10`} placeholder="0,00" inputMode="numeric"
                        value={valorCarro} onChange={e => setValorCarro(fmtInput(e.target.value))} />
                    </div>
                    {veiculo > 0 && veiculo < 5000 && <p className="text-xs text-red-500 mt-1">Valor mínimo: R$ 5.000</p>}
                  </Field>

                  <Field label="Valor de entrada">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">R$</span>
                      <input className={`${inputCls} pl-10`} placeholder="0,00" inputMode="numeric"
                        value={entrada} onChange={e => setEntrada(fmtInput(e.target.value))} />
                    </div>
                  </Field>

                  <Field label="Número de parcelas">
                    <div className="grid grid-cols-5 gap-2">
                      {PARCELAS_OPCOES.map(p => (
                        <button key={p} onClick={() => setParcelas(p)}
                          className={`py-3 rounded-xl text-sm font-black border-2 transition-all ${parcelas === p ? "border-yellow-500 bg-yellow-50 text-yellow-700" : "border-zinc-200 text-zinc-500 hover:border-zinc-300"}`}>
                          {p}x
                        </button>
                      ))}
                    </div>
                  </Field>

                  <div className={`rounded-2xl border-2 p-5 transition-all ${financiado > 0 ? "border-yellow-400 bg-yellow-50" : "border-zinc-100 bg-zinc-50"}`}>
                    <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">Valor a financiar</p>
                    <p className={`text-3xl font-black ${financiado > 0 ? "text-zinc-900" : "text-zinc-300"}`}>
                      {financiado > 0 ? fmt(financiado) : "R$ 0,00"}
                    </p>
                    {veiculo > 0 && entradaVal > 0 && (
                      <p className="text-xs text-zinc-500 mt-1">Entrada de {((entradaVal / veiculo) * 100).toFixed(0)}% do valor do veículo</p>
                    )}
                  </div>
                </div>

                <button onClick={() => setStep(1)} disabled={!step1Valid}
                  className="mt-8 w-full font-black py-4 rounded-full text-sm uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5"
                  style={{ background: "#111", color: "#fff" }}>
                  Continuar
                </button>
              </div>
            )}

            {/* STEP 2 */}
            {step === 1 && (
              <div className="bg-white rounded-3xl p-8" style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>
                <h2 className="text-xl font-black text-zinc-900 mb-1">Seus dados</h2>
                <p className="text-sm text-zinc-400 mb-7">Preencha para receber sua simulação personalizada. Não fazemos consulta ao SPC/Serasa.</p>

                <div className="space-y-5">
                  <Field label="Nome completo">
                    <input className={inputCls} placeholder="Seu nome completo" value={nome} onChange={e => setNome(e.target.value)} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="CPF">
                      <input className={inputCls} placeholder="000.000.000-00" inputMode="numeric"
                        value={cpf} onChange={e => setCpf(formatCpf(e.target.value))} />
                    </Field>
                    <Field label="Data de nascimento">
                      <input className={inputCls} type="date" value={nascimento} onChange={e => setNascimento(e.target.value)} />
                    </Field>
                  </div>
                  <Field label="E-mail">
                    <input className={inputCls} type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Cidade">
                      <input className={inputCls} placeholder="Sua cidade" value={cidade} onChange={e => setCidade(e.target.value)} />
                    </Field>
                    <Field label="WhatsApp">
                      <input className={inputCls} placeholder="(00) 00000-0000" inputMode="numeric"
                        value={whatsapp} onChange={e => setWhatsapp(formatPhone(e.target.value))} />
                    </Field>
                  </div>
                  <Field label="Quando pretende comprar?">
                    <div className="grid grid-cols-2 gap-2">
                      {["1 semana", "15 dias", "1 mês", "Só simulando"].map(op => (
                        <button key={op} onClick={() => setPrazo(op)}
                          className={`py-3 px-3 rounded-xl text-sm font-bold border-2 transition-all text-left ${prazo === op ? "border-yellow-500 bg-yellow-50 text-yellow-700" : "border-zinc-200 text-zinc-500 hover:border-zinc-300"}`}>
                          {op}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>

                <div className="flex gap-3 mt-8">
                  <button onClick={() => setStep(0)} className="px-6 py-4 rounded-full border-2 border-zinc-200 text-zinc-600 font-black text-sm hover:border-zinc-300 transition-all">
                    Voltar
                  </button>
                  <button onClick={handleSubmit} disabled={!step2Valid || loading}
                    className="flex-1 font-black py-4 rounded-full text-sm uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    style={{ background: "#111", color: "#fff" }}>
                    {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    Ver resultado
                  </button>
                </div>
                <p className="text-center text-xs text-zinc-400 mt-4">Seus dados são protegidos e não serão compartilhados com terceiros.</p>
              </div>
            )}

            {/* STEP 3 — Resultado */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="rounded-2xl p-4 flex gap-3" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                  <Icon name="info" className="text-lg flex-shrink-0 mt-0.5 text-amber-600" />
                  <p className="text-xs leading-relaxed" style={{ color: "#92400e" }}>
                    <strong>Simulação indicativa estimada e sujeita à análise de crédito.</strong> Taxas podem variar conforme financeiras. O valor final depende da análise de crédito e condições da instituição financeira parceira.
                  </p>
                </div>

                <div className="rounded-3xl p-8 text-center relative overflow-hidden" style={{ background: "#111" }}>
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(234,179,8,0.15) 0%, transparent 70%)" }} />
                  <p className="text-xs uppercase tracking-widest mb-2 relative z-10" style={{ color: "#6b7280" }}>Parcela estimada a partir de</p>
                  <p className="text-5xl font-black relative z-10" style={{ color: "#EAB308" }}>{fmt(pmt)}</p>
                  <p className="text-sm mt-1 relative z-10" style={{ color: "rgba(234,179,8,0.6)" }}>por mês</p>
                  <p className="text-xs mt-3 relative z-10" style={{ color: "#4b5563" }}>{parcelas} parcelas · taxa estimada 1,79% a.m.</p>
                </div>

                <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
                  <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-5">Detalhamento da simulação</p>
                  <div className="space-y-0">
                    {[
                      { label: "Valor do veículo",               value: fmt(veiculo) },
                      { label: "Entrada",                         value: fmt(entradaVal) },
                      { label: "Valor financiado",                value: fmt(financiado) },
                      { label: "Taxa estimada",                   value: "1,79% a.m. · 23,65% a.a." },
                      { label: "Número de parcelas",              value: `${parcelas}x` },
                      { label: "Valor de cada parcela",           value: fmt(pmt),          highlight: true },
                      { label: "Total de juros estimado",         value: fmt(jurosTotal),   red: true },
                      { label: "Total financiado + juros",        value: fmt(totalPago),    bold: true },
                      { label: "Total geral (entrada + financ.)", value: fmt(totalPago + entradaVal), bold: true },
                    ].map(row => (
                      <div key={row.label} className={`flex justify-between py-3 border-b border-zinc-100 last:border-0 ${row.bold ? "pt-4" : ""}`}>
                        <span className={`text-sm ${row.bold ? "font-black text-zinc-900" : "text-zinc-500"}`}>{row.label}</span>
                        <span className={`text-sm font-black ${row.red ? "text-red-500" : row.highlight ? "text-yellow-600" : "text-zinc-900"}`}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
                  <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-5">O que acontece agora?</p>
                  <div className="space-y-4">
                    {[
                      { icon: "mark_email_read", text: "Seus dados foram enviados para nossa equipe de especialistas." },
                      { icon: "support_agent",   text: "Um consultor entrará em contato pelo WhatsApp informado em breve." },
                      { icon: "handshake",       text: "Você receberá propostas personalizadas das melhores financeiras parceiras." },
                      { icon: "task_alt",        text: "Sem compromisso — você decide se quer avançar ou não." },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(234,179,8,0.12)" }}>
                          <Icon name={item.icon} className="text-base text-yellow-600" />
                        </div>
                        <p className="text-sm text-zinc-600 leading-relaxed pt-1">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl p-6 text-center" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <p className="font-black text-zinc-900 mb-1">Quer falar com um especialista agora?</p>
                  <p className="text-sm text-zinc-500 mb-4">Tire suas dúvidas diretamente pelo WhatsApp.</p>
                  <a href={`https://wa.me/5500000000000?text=Olá! Simulei um financiamento de ${fmt(veiculo)} no ShopMotor e gostaria de mais informações.`}
                    target="_blank"
                    className="inline-flex items-center gap-2 text-white font-black px-6 py-3 rounded-full text-sm hover:opacity-90 transition-opacity"
                    style={{ background: "#16a34a" }}>
                    <Icon name="chat" className="text-base" /> Falar no WhatsApp
                  </a>
                </div>

                <button onClick={resetForm} className="w-full text-sm text-zinc-400 hover:text-zinc-600 transition-colors py-2">
                  Fazer nova simulação
                </button>
              </div>
            )}
          </div>

          {/* Card lateral — consultor */}
          {step < 2 && (
            <div className="hidden lg:flex flex-col gap-4 w-[260px] flex-shrink-0 pt-[72px]">
              {/* Card consultor */}
              <div className="flex flex-col gap-4">
                {/* Imagem consultor */}
                <div className="rounded-3xl overflow-hidden" style={{ height: 320 }}>
                  <img
                    src="/images/consultor.webp"
                    alt="Especialista financeiro"
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* Checklist abaixo do card */}
                <div>
                  <p className="text-sm font-black mb-3 text-zinc-800">Sua simulação é:</p>
                  <div className="space-y-2">
                    {["100% gratuita", "Sem consulta ao SPC/Serasa", "Resposta rápida", "Atendimento humanizado"].map(t => (
                      <div key={t} className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(234,179,8,0.15)" }}>
                          <Icon name="check" className="text-yellow-500 text-[10px]" />
                        </div>
                        <span className="text-sm font-medium text-zinc-600">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          VANTAGENS
      ════════════════════════════════════════════ */}
      <section style={{ background: "#fff", borderTop: "1px solid #f0f0f0", padding: "80px 16px" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#ca8a04" }}>Por que nos escolher</p>
            <h2 className="text-3xl font-black text-zinc-900 mb-3">Por que financiar pela ShopMotor?</h2>
            <p className="text-sm text-zinc-500 max-w-sm mx-auto">Facilitamos todo o processo para você comprar com segurança.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {VANTAGENS.map(v => (
              <div key={v.title}
                className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{ background: "#f9f9f9", border: "1px solid #efefef", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                {/* Imagem */}
                <div className="overflow-hidden relative" style={{ height: 300 }}>
                  <img src={v.img} alt={v.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)" }} />
                  {/* Ícone badge */}
                  <div className="absolute bottom-3 left-3 w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "#EAB308" }}>
                    <Icon name={v.icon} className="text-black text-lg" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-black text-zinc-900 mb-1.5 text-sm">{v.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FINANCEIRAS
      ════════════════════════════════════════════ */}
      <section style={{ background: "#0d0d0d", padding: "56px 16px" }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-black uppercase tracking-widest mb-8" style={{ color: "#4b5563" }}>
            Trabalhamos com as principais financeiras
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {FINANCEIRAS.map(f => (
              <div key={f.name}
                className="flex items-center gap-2.5 px-5 py-3 rounded-full transition-all hover:scale-105"
                style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
                {/* Logo colorida */}
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black"
                  style={{ background: f.bg, color: f.color }}>
                  {f.abbr.slice(0, 2)}
                </div>
                <span className="text-sm font-bold" style={{ color: "#d1d5db" }}>{f.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FAQ
      ════════════════════════════════════════════ */}
      <section style={{ background: "#f5f5f5", borderTop: "1px solid #ebebeb", padding: "80px 16px" }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-center">

            {/* Foto emocional */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="relative rounded-3xl overflow-hidden" style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.15)" }}>
                <img
                  src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=600&q=85"
                  alt="Casal feliz com chave do carro"
                  className="w-full object-cover"
                  style={{ height: 360 }}
                />
                <div className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)" }} />
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="rounded-2xl px-4 py-3" style={{ background: "#EAB308" }}>
                    <p className="font-black text-black text-sm">Aprovação em até 24h</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(0,0,0,0.65)" }}>Sem sair de casa, sem burocracia</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ accordion */}
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#ca8a04" }}>Tire suas dúvidas</p>
              <h2 className="text-3xl font-black text-zinc-900 mb-2">Perguntas frequentes</h2>
              <p className="text-sm text-zinc-500 mb-8">Tudo que você precisa saber sobre financiamento de veículos.</p>

              <div className="space-y-3">
                {FAQS_FIN.map((faq, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden transition-all"
                    style={{ border: "1px solid #e5e5e5", background: "#fff" }}>
                    <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-zinc-50">
                      <span className="font-bold text-zinc-900 text-sm pr-4">{faq.q}</span>
                      <Icon name={faqOpen === i ? "expand_less" : "expand_more"} className="text-zinc-400 flex-shrink-0" />
                    </button>
                    {faqOpen === i && (
                      <div className="px-5 pb-4">
                        <p className="text-sm text-zinc-600 leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CTA FINAL
      ════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: 360 }}>
        {/* Foto de fundo */}
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay escuro */}
        <div className="absolute inset-0" style={{ background: "rgba(10,10,10,0.82)" }} />
        {/* Glow dourado central */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{ width: 600, height: 200, background: "radial-gradient(ellipse, rgba(234,179,8,0.2) 0%, transparent 70%)", filter: "blur(20px)" }} />
        {/* Linhas douradas decorativas */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent 0%, rgba(234,179,8,0.6) 30%, rgba(234,179,8,0.6) 70%, transparent 100%)" }} />
        </div>

        <div className="relative z-10 text-center py-20 px-4">
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "#EAB308" }}>Dê o próximo passo</p>
          <h2 className="font-black text-white mb-4 tracking-tight" style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", lineHeight: 1.1 }}>
            Pronto para dar o{" "}
            <span style={{ color: "#EAB308" }}>próximo passo?</span>
          </h2>
          <p className="mb-10 max-w-md mx-auto leading-relaxed" style={{ color: "#9ca3af", fontSize: 15 }}>
            Faça sua simulação agora e receba uma proposta personalizada sem compromisso.
          </p>
          <button
            onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setStep(0); }}
            className="font-black px-10 py-4 rounded-full text-sm uppercase tracking-widest transition-all hover:-translate-y-0.5 hover:opacity-90"
            style={{ background: "#EAB308", color: "#000", boxShadow: "0 8px 32px rgba(234,179,8,0.35)" }}>
            Simular agora — é grátis
          </button>
        </div>
      </section>

    </div>
  );
}

export default function FinanciamentoPage() {
  return (
    <Suspense>
      <FinanciamentoContent />
    </Suspense>
  );
}
