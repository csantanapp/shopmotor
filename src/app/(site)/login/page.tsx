"use client";

import { Suspense } from "react";
import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") ?? "/perfil";
  // Se o redirect for para uma subrota admin inexistente, cai no dashboard admin
  const VALID_ADMIN_ROUTES = ["/admin", "/admin/receita", "/admin/anuncios", "/admin/usuarios", "/admin/lojas", "/admin/mensagens", "/admin/faq", "/admin/analytics", "/admin/leads", "/admin/assinaturas", "/admin/seo", "/admin/scripts", "/admin/seguros", "/admin/lgpd"];
  const redirect = rawRedirect.startsWith("/admin") && !VALID_ADMIN_ROUTES.includes(rawRedirect) ? "/admin" : rawRedirect;

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(
      emailRef.current!.value.trim(),
      passwordRef.current!.value
    );

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    window.location.href = redirect;
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-on-surface mb-2">
            Bem-vindo de volta
          </h1>
          <p className="text-on-surface-variant text-sm">
            Entre na sua conta para continuar.
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-[0px_12px_40px_rgba(45,47,47,0.08)] p-8">

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {error && (
              <div className="flex items-center gap-2 bg-error/10 text-error rounded-xl px-4 py-3 text-sm font-medium">
                <Icon name="error" className="text-lg flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                E-mail
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                  <Icon name="mail" className="text-xl" />
                </span>
                <input
                  ref={emailRef}
                  id="email"
                  type="email"
                  autoComplete="email"
                  spellCheck={false}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-outline-variant bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="senha" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Senha
                </label>
                <Link href="/esqueci-senha" className="text-xs text-primary font-semibold hover:underline">
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                  <Icon name="lock" className="text-xl" />
                </span>
                <input
                  ref={passwordRef}
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  spellCheck={false}
                  placeholder="Sua senha"
                  required
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-outline-variant bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                >
                  <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-xl" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-black py-4 rounded-full transition-colors uppercase tracking-widest text-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                <>Entrar <Icon name="arrow_forward" /></>
              )}
            </button>

          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-outline-variant" />
            <span className="text-xs text-outline uppercase tracking-widest">ou continue com</span>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>

          <a
            href={`/api/auth/google?redirect=${encodeURIComponent(redirect)}`}
            className="w-full flex items-center justify-center gap-3 border border-outline-variant rounded-full py-3.5 hover:bg-surface-container transition-colors font-semibold text-sm text-on-surface"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Entrar com Google
          </a>

        </div>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          Não tem uma conta?{" "}
          <Link href="/cadastro" className="text-primary font-bold hover:underline">
            Criar conta grátis
          </Link>
        </p>

        <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-outline-variant">
          <Link href="/termos" target="_blank" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
            Termos de Uso
          </Link>
          <span className="text-outline-variant text-xs">·</span>
          <Link href="/privacidade" target="_blank" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
            Política de Privacidade
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
