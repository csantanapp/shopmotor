"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";

export default function ErpLoginPage() {
  const router = useRouter();
  const [email, setEmail]   = useState("");
  const [senha, setSenha]   = useState("");
  const [erro, setErro]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    const res = await fetch("/api/loja/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      router.push("/vendas");
    } else {
      setErro(data.error ?? "Erro ao autenticar.");
    }
  }

  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container shadow-lg shadow-primary-container/30">
            <Icon name="bolt" className="text-black text-xl" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-black text-white tracking-wide">ShopMotor</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-container">ERP · Colaborador</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-lg font-black text-white mb-1">Entrar no painel</h1>
          <p className="text-sm text-white/40 mb-6">Acesse com suas credenciais de colaborador</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-white/40 mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="seu@email.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-primary-container/60 focus:bg-white/10 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-white/40 mb-1.5">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-primary-container/60 focus:bg-white/10 transition"
              />
            </div>

            {erro && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                <Icon name="error" className="text-red-400 text-sm shrink-0" />
                <p className="text-xs text-red-400">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-container py-3 text-sm font-black text-black hover:opacity-90 transition disabled:opacity-50 mt-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          Lojista?{" "}
          <a href="/login" className="text-primary-container hover:opacity-80 font-bold">Acesse sua conta</a>
        </p>
      </div>
    </div>
  );
}
