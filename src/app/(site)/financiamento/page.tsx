"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

// ── Internal config ──────────────────────────────────────────────────────────
const TAXA_MENSAL = 0.0179; // 1,79% a.m.
const PARCELAS_OPCOES = [12, 24, 36, 48, 60];

function calcPMT(pv: number, i: number, n: number) {
  if (i === 0) return pv / n;
  return (pv * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
}

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}

function fmtInput(raw: string) {
  const digits = raw.replace(/\D/g, "");
  const num = Number(digits) / 100;
  if (!digits) return "";
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function parseVal(s: string) {
  return parseFloat(s.replace(/\./g, "").replace(",", ".")) || 0;
}

// ── Step indicator ────────────────────────────────────────────────────────────
function Steps({ current }: { current: number }) {
  const steps = ["Veículo", "Dados", "Resultado"];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all
                ${done ? "bg-yellow-500 text-black" : active ? "bg-zinc-900 text-white ring-4 ring-yellow-400/40" : "bg-zinc-100 text-zinc-400"}`}>
                {done ? <Icon name="check" className="text-base" /> : i + 1}
              </div>
              <span className={`text-[11px] mt-1.5 font-bold uppercase tracking-wider ${active ? "text-zinc-900" : done ? "text-yellow-600" : "text-zinc-400"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-16 md:w-24 h-0.5 mx-1 mb-5 transition-all ${done ? "bg-yellow-500" : "bg-zinc-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/20 transition-all bg-white";

// ── Main component ────────────────────────────────────────────────────────────
export default function FinanciamentoPage() {
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);

  // Step 1
  const [valorCarro, setValorCarro] = useState("");
  const [parcelas, setParcelas] = useState<number>(48);
  const [entrada, setEntrada] = useState("");

  // Step 2
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [email, setEmail] = useState("");
  const [cidade, setCidade] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [prazo, setPrazo] = useState("");
  const [loading, setLoading] = useState(false);

  const veiculo = parseVal(valorCarro);
  const entradaVal = parseVal(entrada);
  const financiado = Math.max(veiculo - entradaVal, 0);
  const pmt = financiado > 0 ? calcPMT(financiado, TAXA_MENSAL, parcelas) : 0;
  const totalPago = pmt * parcelas;
  const jurosTotal = totalPago - financiado;

  function formatCpf(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
            .replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3")
            .replace(/(\d{3})(\d{3})/, "$1.$2")
            .replace(/(\d{3})/, "$1");
  }

  function formatPhone(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  }

  const step1Valid = veiculo >= 5000 && parcelas > 0 && entradaVal >= 0 && entradaVal < veiculo;
  const step2Valid = nome.trim() && cpf.length >= 14 && nascimento && email.includes("@") && cidade.trim() && whatsapp.length >= 14 && prazo;

  async function handleSubmit() {
    setLoading(true);
    try {
      await fetch("/api/financiamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, cpf, nascimento, email, cidade, whatsapp, prazo, valorCarro: veiculo, entrada: entradaVal, parcelas, financiado, pmt }),
      });
    } catch {}
    setLoading(false);
    setSent(true);
  }

  if (sent) return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Icon name="check_circle" className="text-green-600 text-4xl" />
        </div>
        <h2 className="text-2xl font-black text-zinc-900 mb-2">Simulação enviada!</h2>
        <p className="text-zinc-500 text-sm leading-relaxed mb-6">
          Recebemos seus dados. Em breve um especialista entrará em contato pelo WhatsApp informado para apresentar as melhores condições.
        </p>
        <div className="bg-zinc-50 rounded-2xl p-5 text-left mb-6 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-zinc-500">Veículo</span><span className="font-bold">{fmt(veiculo)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-zinc-500">Entrada</span><span className="font-bold">{fmt(entradaVal)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-zinc-500">Parcelas</span><span className="font-bold">{parcelas}x de {fmt(pmt)}</span></div>
        </div>
        <Link href="/" className="block w-full bg-zinc-900 text-white font-black py-3 rounded-full text-sm hover:bg-zinc-700 transition-colors">
          Voltar ao início
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero */}
      <div className="bg-zinc-900 text-white py-14 px-4 text-center">
        <p className="text-yellow-400 text-xs font-black uppercase tracking-widest mb-3">Simulação gratuita</p>
        <h1 className="text-3xl md:text-4xl font-black mb-3">Financiamento de Veículos</h1>
        <p className="text-zinc-400 text-sm max-w-md mx-auto">Simule agora e descubra as condições ideais para comprar seu veículo com as melhores taxas do mercado.</p>
      </div>

      <div className="max-w-xl mx-auto px-4 py-12">
        <Steps current={step} />

        {/* ── STEP 1 ── */}
        {step === 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-8">
            <h2 className="text-xl font-black text-zinc-900 mb-1">Dados do veículo</h2>
            <p className="text-sm text-zinc-400 mb-7">Preencha as informações do carro que você quer financiar.</p>

            <div className="space-y-5">
              <Field label="Valor do veículo">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">R$</span>
                  <input
                    className={`${inputCls} pl-10`}
                    placeholder="0,00"
                    inputMode="numeric"
                    value={valorCarro}
                    onChange={e => setValorCarro(fmtInput(e.target.value))}
                  />
                </div>
                {veiculo > 0 && veiculo < 5000 && <p className="text-xs text-red-500 mt-1">Valor mínimo: R$ 5.000</p>}
              </Field>

              <Field label="Valor de entrada">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">R$</span>
                  <input
                    className={`${inputCls} pl-10`}
                    placeholder="0,00"
                    inputMode="numeric"
                    value={entrada}
                    onChange={e => setEntrada(fmtInput(e.target.value))}
                  />
                </div>
                {veiculo > 0 && entradaVal > 0 && (
                  <p className="text-xs text-zinc-400 mt-1">
                    {((entradaVal / veiculo) * 100).toFixed(0)}% do valor do veículo
                  </p>
                )}
              </Field>

              <Field label="Número de parcelas">
                <div className="grid grid-cols-5 gap-2">
                  {PARCELAS_OPCOES.map(p => (
                    <button
                      key={p}
                      onClick={() => setParcelas(p)}
                      className={`py-3 rounded-xl text-sm font-black border-2 transition-all ${
                        parcelas === p
                          ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                          : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                      }`}
                    >
                      {p}x
                    </button>
                  ))}
                </div>
              </Field>

              {/* Preview */}
              {financiado > 0 && (
                <div className="bg-zinc-50 rounded-2xl p-5 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-zinc-500">Valor financiado</span><span className="font-bold text-zinc-900">{fmt(financiado)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-zinc-500">Estimativa de parcela</span><span className="font-black text-yellow-600 text-base">{parcelas}x de {fmt(pmt)}</span></div>
                  <p className="text-xs text-zinc-400">Taxa estimada 1,79% a.m. · sujeita à análise de crédito</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setStep(1)}
              disabled={!step1Valid}
              className="mt-8 w-full bg-zinc-900 text-white font-black py-4 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 1 && (
          <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-8">
            <h2 className="text-xl font-black text-zinc-900 mb-1">Seus dados</h2>
            <p className="text-sm text-zinc-400 mb-7">Para receber sua simulação personalizada, precisamos de algumas informações.</p>

            <div className="space-y-5">
              <Field label="Nome completo">
                <input className={inputCls} placeholder="Digite seu nome" value={nome} onChange={e => setNome(e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="CPF">
                  <input className={inputCls} placeholder="000.000.000-00" inputMode="numeric" value={cpf}
                    onChange={e => setCpf(formatCpf(e.target.value))} />
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
                  <input className={inputCls} placeholder="(00) 00000-0000" inputMode="numeric" value={whatsapp}
                    onChange={e => setWhatsapp(formatPhone(e.target.value))} />
                </Field>
              </div>
              <Field label="Quando pretende comprar?">
                <div className="grid grid-cols-2 gap-2">
                  {["1 semana", "15 dias", "1 mês", "Só simulando"].map(op => (
                    <button
                      key={op}
                      onClick={() => setPrazo(op)}
                      className={`py-3 px-3 rounded-xl text-sm font-bold border-2 transition-all text-left ${
                        prazo === op
                          ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                          : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                      }`}
                    >
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
              <button
                onClick={() => { setStep(2); handleSubmit(); }}
                disabled={!step2Valid || loading}
                className="flex-1 bg-zinc-900 text-white font-black py-4 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Ver resultado
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 — Resultado ── */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Aviso */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
              <Icon name="info" className="text-amber-500 text-lg flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>Aviso obrigatório:</strong> Esta é apenas uma simulação estimada. O valor final depende da análise de crédito e condições da instituição financeira.
              </p>
            </div>

            {/* Card principal */}
            <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-8">
              <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-5">Resultado da simulação</p>

              {/* Parcela destaque */}
              <div className="text-center bg-zinc-900 rounded-2xl p-6 mb-6">
                <p className="text-zinc-400 text-xs uppercase tracking-widest mb-1">Parcela estimada a partir de</p>
                <p className="text-4xl font-black text-yellow-400">{fmt(pmt)}<span className="text-lg text-yellow-500">/mês</span></p>
                <p className="text-zinc-500 text-xs mt-2">{parcelas} parcelas · taxa estimada 1,79% a.m.</p>
                <p className="text-zinc-600 text-[11px] mt-1">*Simulação indicativa sujeita à análise de crédito</p>
              </div>

              {/* Detalhes */}
              <div className="space-y-3">
                {[
                  { label: "Valor do veículo", value: fmt(veiculo) },
                  { label: "Entrada", value: fmt(entradaVal) },
                  { label: "Valor financiado", value: fmt(financiado) },
                  { label: "Número de parcelas", value: `${parcelas}x` },
                  { label: "Taxa estimada", value: "1,79% a.m." },
                  { label: "Total de juros estimado", value: fmt(jurosTotal), accent: true },
                  { label: "Total a pagar", value: fmt(totalPago + entradaVal), bold: true },
                ].map(row => (
                  <div key={row.label} className={`flex justify-between py-2.5 border-b border-zinc-100 last:border-0 ${row.bold ? "pt-3" : ""}`}>
                    <span className={`text-sm ${row.bold ? "font-black text-zinc-900" : "text-zinc-500"}`}>{row.label}</span>
                    <span className={`text-sm font-black ${row.accent ? "text-red-500" : row.bold ? "text-zinc-900 text-base" : "text-zinc-900"}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
              <Icon name="support_agent" className="text-yellow-600 text-3xl mb-3" />
              <h3 className="font-black text-zinc-900 mb-1">Quer a aprovação mais rápida?</h3>
              <p className="text-sm text-zinc-500 mb-4">Um especialista já recebeu sua simulação e entrará em contato pelo WhatsApp informado.</p>
              <Link
                href={`https://wa.me/5500000000000?text=Olá! Simulei um financiamento de ${fmt(veiculo)} no ShopMotor e gostaria de mais informações.`}
                target="_blank"
                className="inline-flex items-center gap-2 bg-green-600 text-white font-black px-6 py-3 rounded-full text-sm hover:bg-green-700 transition-colors"
              >
                <Icon name="chat" className="text-base" />
                Falar no WhatsApp
              </Link>
            </div>

            <button onClick={() => { setStep(0); setSent(false); setValorCarro(""); setEntrada(""); setParcelas(48); }}
              className="w-full text-sm text-zinc-400 hover:text-zinc-600 transition-colors py-2">
              Fazer nova simulação
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
