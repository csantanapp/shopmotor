"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!token) return (
    <div className="text-center space-y-4">
      <Icon name="link_off" className="text-5xl text-outline mx-auto" />
      <p className="font-black text-on-surface">Link invalido</p>
      <p className="text-sm text-on-surface-variant">Este link nao e valido. Solicite um novo.</p>
      <Link href="/esqueci-senha" className="text-primary font-bold hover:underline text-sm">Solicitar novo link</Link>
    </div>
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("As senhas nao coincidem."); return; }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Erro ao redefinir senha."); return; }
    setDone(true);
    setTimeout(() => router.push("/login"), 3000);
  }

  if (done) return (
    <div className="text-center space-y-4">
      <Icon name="check_circle" className="text-5xl text-green-600 mx-auto" />
      <div>
        <p className="font-black text-on-surface">Senha redefinida!</p>
        <p className="text-sm text-on-surface-variant mt-1">Redirecionando para o login...</p>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 bg-error/10 text-error rounded-xl px-4 py-3 text-sm font-medium">
          <Icon name="error" className="text-lg flex-shrink-0" />{error}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Nova senha</label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required minLength={8}
            placeholder="Minimo 8 caracteres"
            className="w-full bg-surface-container-low border-0 rounded-xl p-3 pr-10 text-sm focus:ring-2 focus:ring-primary-container outline-none"
          />
          <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
            <Icon name={showPw ? "visibility_off" : "visibility"} className="text-lg" />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Confirmar nova senha</label>
        <input
          type={showPw ? "text" : "password"}
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          placeholder="Repita a nova senha"
          className="bg-surface-container-low border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-container text-on-primary-container font-black py-3.5 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading && <span className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />}
        Redefinir senha
      </button>
    </form>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-sm p-10 space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-primary-container/20 flex items-center justify-center mb-2">
            <Icon name="lock" className="text-3xl text-primary" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-on-surface">Nova senha</h1>
          <p className="text-sm text-on-surface-variant">Escolha uma senha segura com pelo menos 8 caracteres.</p>
        </div>
        <Suspense>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
