"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

// ── Config interno ────────────────────────────────────────────────────────────
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
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return (Number(digits) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
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

// ── Step indicator ────────────────────────────────────────────────────────────
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
              <span className={`text-[11px] mt-1.5 font-bold uppercase tracking-wider whitespace-nowrap ${active ? "text-zinc-900" : done ? "text-yellow-600" : "text-zinc-400"}`}>
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

// ── Vantagens (enriquecimento da página) ─────────────────────────────────────
const VANTAGENS = [
  { icon: "speed", title: "Aprovação rápida", desc: "Análise em até 24h com retorno pelo WhatsApp." },
  { icon: "percent", title: "Taxas competitivas", desc: "Trabalhamos com as melhores financeiras do país." },
  { icon: "lock", title: "Dados protegidos", desc: "Suas informações são tratadas com total sigilo e segurança." },
  { icon: "support_agent", title: "Consultoria gratuita", desc: "Especialistas disponíveis para tirar todas as suas dúvidas." },
];

const FINANCEIRAS = ["Banco do Brasil", "Bradesco Financiamentos", "Santander Auto", "Itaú Unibanco", "BV Financeira", "Caixa Econômica"];

const FAQS_FIN = [
  { q: "Quem pode fazer a simulação?", a: "Qualquer pessoa maior de 18 anos com CPF válido pode simular. A aprovação final depende da análise de crédito da financeira parceira." },
  { q: "A simulação compromete meu crédito?", a: "Não. A simulação é apenas estimada e não realiza consulta ao SPC/Serasa. A análise real só ocorre quando você der andamento ao processo." },
  { q: "Quanto tempo leva a aprovação?", a: "Após o envio da documentação completa, a análise costuma ser concluída em até 1 dia útil." },
  { q: "Quais documentos são necessários?", a: "RG/CNH, CPF, comprovante de renda (holerite ou declaração IR) e comprovante de residência atualizado." },
  { q: "Posso financiar 100% do veículo?", a: "Em geral as financeiras financiam até 80-90% do valor do veículo. Uma entrada mínima facilita a aprovação e reduz o valor das parcelas." },
  { q: "A taxa de juros pode mudar?", a: "Sim. A taxa da simulação é estimada com base nas médias de mercado. A taxa final é definida pela financeira após análise de crédito." },
];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function FinanciamentoPage() {
  const [step, setStep] = useState(0);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

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
  const pmt = calcPMT(financiado, TAXA_MENSAL, parcelas);
  const totalPago = pmt * parcelas;
  const jurosTotal = totalPago - financiado;

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
    setStep(2);
  }

  return (
    <div className="min-h-screen bg-zinc-50">

      {/* ── Hero ── */}
      <div className="bg-zinc-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            <Icon name="verified" className="text-sm" /> Simulação gratuita · sem consulta ao SPC
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">Financie seu veículo<br/>com as melhores taxas</h1>
          <p className="text-zinc-400 max-w-xl mx-auto mb-8">Simule agora em segundos e receba o contato de um especialista com as condições personalizadas para o seu perfil.</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-400">
            {["Sem compromisso", "Análise em 24h", "100% gratuito", "Mais de 6 financeiras parceiras"].map(t => (
              <span key={t} className="flex items-center gap-1.5"><Icon name="check_circle" className="text-yellow-500 text-base" />{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Simulador ── */}
      <div className="max-w-xl mx-auto px-4 py-12">
        <Steps current={step} />

        {/* STEP 1 */}
        {step === 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-8">
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

              {/* Valor a financiar */}
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
              className="mt-8 w-full bg-zinc-900 text-white font-black py-4 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              Continuar
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 1 && (
          <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-8">
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
                className="flex-1 bg-zinc-900 text-white font-black py-4 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
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
            {/* Aviso obrigatório */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
              <Icon name="info" className="text-amber-500 text-lg flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>Simulação indicativa estimada e sujeita à análise de crédito.</strong> Taxas podem variar conforme financeiras. O valor final depende da análise de crédito e condições da instituição financeira parceira.
              </p>
            </div>

            {/* Parcela destaque */}
            <div className="bg-zinc-900 rounded-3xl p-8 text-center">
              <p className="text-zinc-400 text-xs uppercase tracking-widest mb-2">Parcela estimada a partir de</p>
              <p className="text-5xl font-black text-yellow-400">{fmt(pmt)}</p>
              <p className="text-yellow-500/70 text-sm mt-1">por mês</p>
              <p className="text-zinc-500 text-xs mt-3">{parcelas} parcelas · taxa estimada 1,79% a.m.</p>
            </div>

            {/* Detalhamento */}
            <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-6">
              <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-5">Detalhamento da simulação</p>
              <div className="space-y-0">
                {[
                  { label: "Valor do veículo", value: fmt(veiculo) },
                  { label: "Entrada", value: fmt(entradaVal) },
                  { label: "Valor financiado", value: fmt(financiado) },
                  { label: "Taxa estimada", value: "1,79% a.m. · 23,65% a.a." },
                  { label: "Número de parcelas", value: `${parcelas}x` },
                  { label: "Valor de cada parcela", value: fmt(pmt), highlight: true },
                  { label: "Total de juros estimado", value: fmt(jurosTotal), red: true },
                  { label: "Total financiado + juros", value: fmt(totalPago), bold: true },
                  { label: "Total geral (entrada + financ.)", value: fmt(totalPago + entradaVal), bold: true },
                ].map(row => (
                  <div key={row.label} className={`flex justify-between py-3 border-b border-zinc-100 last:border-0 ${row.bold ? "pt-4" : ""}`}>
                    <span className={`text-sm ${row.bold ? "font-black text-zinc-900" : "text-zinc-500"}`}>{row.label}</span>
                    <span className={`text-sm font-black ${row.red ? "text-red-500" : row.highlight ? "text-yellow-600" : row.bold ? "text-zinc-900" : "text-zinc-900"}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Próximos passos */}
            <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-6">
              <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-5">O que acontece agora?</p>
              <div className="space-y-4">
                {[
                  { icon: "mark_email_read", text: "Seus dados foram enviados para nossa equipe de especialistas." },
                  { icon: "support_agent", text: "Um consultor entrará em contato pelo WhatsApp informado em breve." },
                  { icon: "handshake", text: "Você receberá propostas personalizadas das melhores financeiras parceiras." },
                  { icon: "task_alt", text: "Sem compromisso — você decide se quer avançar ou não." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                      <Icon name={item.icon} className="text-zinc-500 text-base" />
                    </div>
                    <p className="text-sm text-zinc-600 leading-relaxed pt-1">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA WhatsApp */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <p className="font-black text-zinc-900 mb-1">Quer falar com um especialista agora?</p>
              <p className="text-sm text-zinc-500 mb-4">Tire suas dúvidas diretamente pelo WhatsApp.</p>
              <a href={`https://wa.me/5500000000000?text=Olá! Simulei um financiamento de ${fmt(veiculo)} no ShopMotor e gostaria de mais informações.`}
                target="_blank"
                className="inline-flex items-center gap-2 bg-green-600 text-white font-black px-6 py-3 rounded-full text-sm hover:bg-green-700 transition-colors">
                <Icon name="chat" className="text-base" /> Falar no WhatsApp
              </a>
            </div>

            <button onClick={() => { setStep(0); setValorCarro(""); setEntrada(""); setParcelas(48); setNome(""); setCpf(""); setNascimento(""); setEmail(""); setCidade(""); setWhatsapp(""); setPrazo(""); }}
              className="w-full text-sm text-zinc-400 hover:text-zinc-600 transition-colors py-2">
              Fazer nova simulação
            </button>
          </div>
        )}
      </div>

      {/* ── Vantagens ── */}
      <div className="bg-white border-t border-zinc-100 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-zinc-900 mb-2">Por que financiar pela ShopMotor?</h2>
            <p className="text-zinc-500 text-sm">Facilitamos todo o processo para você comprar com segurança.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VANTAGENS.map(v => (
              <div key={v.title} className="text-center p-6 rounded-2xl bg-zinc-50 border border-zinc-100">
                <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon name={v.icon} className="text-yellow-600 text-2xl" />
                </div>
                <h3 className="font-black text-zinc-900 mb-2">{v.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Financeiras parceiras ── */}
      <div className="bg-zinc-50 border-t border-zinc-100 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-6">Trabalhamos com as principais financeiras</p>
          <div className="flex flex-wrap justify-center gap-3">
            {FINANCEIRAS.map(f => (
              <span key={f} className="bg-white border border-zinc-200 text-zinc-600 text-sm font-bold px-5 py-2.5 rounded-full shadow-sm">{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="bg-white border-t border-zinc-100 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-zinc-900 mb-2">Perguntas frequentes</h2>
            <p className="text-zinc-500 text-sm">Tudo que você precisa saber sobre financiamento de veículos.</p>
          </div>
          <div className="space-y-3">
            {FAQS_FIN.map((faq, i) => (
              <div key={i} className="border border-zinc-200 rounded-2xl overflow-hidden">
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-zinc-50 transition-colors">
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

      {/* ── CTA final ── */}
      <div className="bg-zinc-900 text-white py-16 px-4 text-center">
        <h2 className="text-3xl font-black mb-3">Pronto para dar o próximo passo?</h2>
        <p className="text-zinc-400 mb-8 max-w-md mx-auto">Faça sua simulação agora e receba uma proposta personalizada sem compromisso.</p>
        <button onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); setStep(0); }}
          className="bg-yellow-500 text-black font-black px-10 py-4 rounded-full text-sm uppercase tracking-widest hover:bg-yellow-400 transition-colors">
          Simular agora — é grátis
        </button>
      </div>

    </div>
  );
}
