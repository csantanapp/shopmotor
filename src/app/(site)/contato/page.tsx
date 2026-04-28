"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContatoPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function set(k: string, v: string) {
    setForm(p => ({ ...p, [k]: v }));
  }

  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Erro ao enviar mensagem.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">

      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-widest text-primary">Suporte</p>
        <h1 className="text-4xl font-black tracking-tighter text-on-surface">Contato</h1>
        <p className="text-on-surface-variant text-sm">Estamos aqui para ajudar. Escolha o canal que preferir.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: "mail", label: "E-mail", value: "contato@shopmotor.com.br", sub: "Resposta em até 24h" },
          { icon: "support_agent", label: "Suporte", value: "Seg–Sex, 9h–18h", sub: "Atendimento online" },
        ].map(item => (
          <div key={item.label} className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-xl">{item.icon}</span>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">{item.label}</p>
              <p className="font-bold text-on-surface text-sm mt-0.5">{item.value}</p>
              <p className="text-xs text-on-surface-variant">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

        {/* Formulário */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-8 space-y-5">
          <h2 className="font-black text-on-surface">Envie uma mensagem</h2>

          {sent ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <span className="material-symbols-outlined text-green-600 text-5xl">check_circle</span>
              <div>
                <p className="font-black text-on-surface">Mensagem enviada!</p>
                <p className="text-sm text-on-surface-variant mt-1">Retornaremos em até 24 horas úteis.</p>
              </div>
              <button
                onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                className="text-sm text-primary font-bold hover:underline"
              >
                Enviar outra mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Seu nome" value={form.name} onChange={v => set("name", v)} required />
              <Field label="E-mail" type="email" value={form.email} onChange={v => set("email", v)} required />
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Assunto</label>
                <select
                  value={form.subject}
                  onChange={e => set("subject", e.target.value)}
                  required
                  className="bg-surface-container-low border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none"
                >
                  <option value="">Selecione</option>
                  <option>Problema com anúncio</option>
                  <option>Problema com conta</option>
                  <option>Denúncia de fraude</option>
                  <option>Dúvida sobre pagamento</option>
                  <option>Sugestão</option>
                  <option>Outro</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Mensagem</label>
                <textarea
                  value={form.message}
                  onChange={e => set("message", e.target.value)}
                  required
                  rows={5}
                  placeholder="Descreva sua dúvida ou problema em detalhes..."
                  className="bg-surface-container-low border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none resize-none"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-container text-on-primary-container font-black py-3 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <span className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />}
                Enviar mensagem
              </button>
            </form>
          )}
        </div>

        {/* Links úteis */}
        <div className="space-y-4">
          <h2 className="font-black text-on-surface">Antes de entrar em contato</h2>
          <p className="text-sm text-on-surface-variant">Sua resposta pode estar em um desses recursos:</p>
          <div className="space-y-3">
            {[
              { href: "/ajuda", icon: "help_center", label: "Central de Ajuda", desc: "Artigos sobre todos os tópicos da plataforma" },
              { href: "/faq", icon: "quiz", label: "Dúvidas Frequentes", desc: "As perguntas mais comuns respondidas" },
              { href: "/seguranca", icon: "shield", label: "Segurança", desc: "Dicas para comprar e vender com segurança" },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-start gap-4 bg-surface-container-lowest rounded-2xl p-4 shadow-sm hover:bg-surface-container-high transition-colors group"
              >
                <span className="material-symbols-outlined text-primary text-xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">{item.label}</p>
                  <p className="text-xs text-on-surface-variant">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} required={required}
        className="bg-surface-container-low border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none"
      />
    </div>
  );
}
