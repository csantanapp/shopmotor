"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Suspense } from "react";

function formatPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
  return d.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
}

function formatCNPJ(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  return d.replace(/^(\d{2})(\d)/, "$1.$2")
          .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
          .replace(/\.(\d{3})(\d)/, ".$1/$2")
          .replace(/(\d{4})(\d)/, "$1-$2");
}

function CompletarForm() {
  const { refresh } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/perfil";

  const [accountType, setAccountType] = useState<"PF" | "PJ">("PF");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    phone: "", termos: false,
    cnpj: "", companyName: "", tradeName: "",
  });

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.phone || form.phone.replace(/\D/g, "").length < 10) {
      setError("Informe um telefone válido."); return;
    }
    if (!form.termos) { setError("Aceite os Termos de Uso para continuar."); return; }

    setLoading(true);
    const res = await fetch("/api/auth/complete-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, accountType }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Erro ao salvar."); return; }

    await refresh();
    router.push(redirect);
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="font-headline text-4xl font-black uppercase tracking-tight text-on-surface mb-2">
            Complete seu perfil
          </h1>
          <p className="text-on-surface-variant text-sm">
            Só mais alguns dados para ativar sua conta.
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container p-8">

          {/* Tipo de conta */}
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-3">Tipo de conta</p>
            <div className="grid grid-cols-2 gap-3">
              {(["PF", "PJ"] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAccountType(type)}
                  className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                    accountType === type
                      ? "border-primary-container bg-primary-container/10 text-on-surface"
                      : "border-surface-container text-on-surface-variant hover:border-outline"
                  }`}
                >
                  {type === "PF" ? "Pessoa Física" : "Pessoa Jurídica (Loja)"}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Telefone */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-1.5">
                Telefone / WhatsApp *
              </label>
              <input
                type="tel"
                placeholder="(11) 99999-9999"
                value={form.phone}
                onChange={e => set("phone", formatPhone(e.target.value))}
                className="w-full border border-outline-variant rounded-xl px-4 py-3 text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                required
              />
            </div>

            {/* PJ fields */}
            {accountType === "PJ" && (
              <>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-1.5">
                    CNPJ *
                  </label>
                  <input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={form.cnpj}
                    onChange={e => set("cnpj", formatCNPJ(e.target.value))}
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-1.5">
                    Razão Social *
                  </label>
                  <input
                    type="text"
                    placeholder="Nome da empresa"
                    value={form.companyName}
                    onChange={e => set("companyName", e.target.value)}
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-1.5">
                    Nome fantasia
                  </label>
                  <input
                    type="text"
                    placeholder="Como aparece para os clientes"
                    value={form.tradeName}
                    onChange={e => set("tradeName", e.target.value)}
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 text-on-surface bg-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
              </>
            )}

            {/* Termos */}
            <label className="flex items-start gap-3 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={form.termos}
                onChange={e => set("termos", e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-yellow-400 flex-shrink-0"
              />
              <span className="text-sm text-on-surface-variant">
                Li e aceito os{" "}
                <Link href="/termos" target="_blank" className="text-primary underline">Termos de Uso</Link>
                {" "}e a{" "}
                <Link href="/privacidade" target="_blank" className="text-primary underline">Política de Privacidade</Link>
              </span>
            </label>

            {error && (
              <div className="bg-error-container/10 border border-error-container text-error rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-container text-on-primary-container font-black py-4 rounded-xl uppercase tracking-widest text-sm hover:bg-primary-fixed-dim transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? "Salvando..." : "Ativar minha conta →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CompletarCadastroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-on-surface-variant text-sm">Carregando...</div>}>
      <CompletarForm />
    </Suspense>
  );
}
