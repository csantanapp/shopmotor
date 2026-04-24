"use client";

import { useState } from "react";

export default function MarcaForm() {
  const [form, setForm] = useState({
    company: "", name: "", email: "", phone: "", segment: "", budget: "", message: "",
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(k: string, v: string) {
    setForm(p => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/anuncie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Erro ao enviar proposta.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-14 text-center">
        <span className="material-symbols-outlined text-green-600 text-6xl">check_circle</span>
        <div>
          <p className="text-xl font-black text-on-surface">Proposta recebida!</p>
          <p className="text-sm text-on-surface-variant mt-2 max-w-sm">
            Nossa equipe comercial entrara em contato em ate 2 dias uteis para apresentar as opcoes de midia.
          </p>
        </div>
        <button
          onClick={() => { setSent(false); setForm({ company: "", name: "", email: "", phone: "", segment: "", budget: "", message: "" }); }}
          className="text-sm text-primary font-bold hover:underline mt-2"
        >
          Enviar outra proposta
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Empresa / Marca" value={form.company} onChange={v => set("company", v)} required placeholder="Ex: Toyota, Localiza, Bosch..." />
        <Field label="Seu nome" value={form.name} onChange={v => set("name", v)} required placeholder="Nome completo" />
        <Field label="E-mail comercial" type="email" value={form.email} onChange={v => set("email", v)} required placeholder="contato@empresa.com.br" />
        <Field label="Telefone / WhatsApp" type="tel" value={form.phone} onChange={v => set("phone", v)} placeholder="(00) 00000-0000" />

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Segmento</label>
          <select
            value={form.segment}
            onChange={e => set("segment", e.target.value)}
            required
            className="bg-surface-container-low border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none"
          >
            <option value="">Selecione</option>
            <option>Montadora / Importadora</option>
            <option>Concessionaria</option>
            <option>Seguro automotivo</option>
            <option>Financiamento / Banco</option>
            <option>Autopecas / Acessorios</option>
            <option>Combustivel / Lubrificantes</option>
            <option>Rastreamento / Tecnologia</option>
            <option>Outro</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Investimento mensal estimado</label>
          <select
            value={form.budget}
            onChange={e => set("budget", e.target.value)}
            required
            className="bg-surface-container-low border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none"
          >
            <option value="">Selecione</option>
            <option>Ate R$ 2.000</option>
            <option>R$ 2.000 a R$ 5.000</option>
            <option>R$ 5.000 a R$ 15.000</option>
            <option>R$ 15.000 a R$ 50.000</option>
            <option>Acima de R$ 50.000</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Objetivo da campanha (opcional)</label>
        <textarea
          value={form.message}
          onChange={e => set("message", e.target.value)}
          rows={3}
          placeholder="Descreva o que voce quer atingir com a publicidade na ShopMotor..."
          className="bg-surface-container-low border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-inverse-surface text-inverse-on-surface font-black py-4 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading && <span className="w-4 h-4 border-2 border-inverse-on-surface/30 border-t-inverse-on-surface rounded-full animate-spin" />}
        Solicitar proposta comercial
      </button>

      <p className="text-center text-xs text-on-surface-variant">
        Ao enviar, voce concorda com nossa{" "}
        <a href="/privacidade" className="text-primary hover:underline">Politica de Privacidade</a>.
        Retornaremos em ate 2 dias uteis.
      </p>
    </form>
  );
}

function Field({ label, value, onChange, type = "text", required = false, placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        required={required} placeholder={placeholder}
        className="bg-surface-container-low border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none"
      />
    </div>
  );
}
