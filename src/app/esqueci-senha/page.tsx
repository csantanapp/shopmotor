"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Erro ao enviar e-mail.");
      return;
    }
    setSent(true);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-sm p-10 space-y-6">

        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-primary-container/20 flex items-center justify-center mb-2">
            <Icon name="lock_reset" className="text-3xl text-primary" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-on-surface">Esqueceu a senha?</h1>
          <p className="text-sm text-on-surface-variant">
            Informe seu e-mail cadastrado e enviaremos um link para redefinir sua senha.
          </p>
        </div>

        {sent ? (
          <div className="space-y-5">
            <div className="flex items-start gap-3 bg-green-50 rounded-2xl p-4">
              <Icon name="mark_email_read" className="text-green-600 text-2xl flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-green-800 text-sm">E-mail enviado!</p>
                <p className="text-sm text-green-700 mt-1">
                  Se <strong>{email}</strong> estiver cadastrado, voce recebera um link em alguns minutos.
                  Verifique tambem a pasta de spam.
                </p>
              </div>
            </div>
            <Link
              href="/login"
              className="block text-center text-sm font-bold text-primary hover:underline"
            >
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 bg-error/10 text-error rounded-xl px-4 py-3 text-sm font-medium">
                <Icon name="error" className="text-lg flex-shrink-0" />{error}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="seu@email.com.br"
                className="bg-surface-container-low border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-container text-on-primary-container font-black py-3.5 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />}
              Enviar link de redefinicao
            </button>
            <Link href="/login" className="block text-center text-sm text-on-surface-variant hover:text-primary transition-colors">
              Voltar para o login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
