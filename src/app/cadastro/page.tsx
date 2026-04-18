"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/context/AuthContext";

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export default function CadastroPage() {
  const { refresh } = useAuth();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    zipCode: "",
    state: "",
    address: "",
    city: "",
    password: "",
    confirmPassword: "",
    termos: false,
  });

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!form.termos) {
      setError("Aceite os Termos de Uso para continuar.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone,
        zipCode: form.zipCode,
        state: form.state,
        address: form.address,
        city: form.city,
        password: form.password,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Erro ao criar conta.");
      return;
    }

    await refresh();
    router.push("/perfil");
    router.refresh();
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-on-surface mb-2">
            Crie sua conta
          </h1>
          <p className="text-on-surface-variant text-sm">
            Compre, venda e anuncie veículos em um só lugar.
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-[0px_12px_40px_rgba(45,47,47,0.08)] p-8">

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Erro */}
            {error && (
              <div className="flex items-center gap-2 bg-error/10 text-error rounded-xl px-4 py-3 text-sm font-medium">
                <Icon name="error" className="text-lg flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Nome */}
            <div>
              <label htmlFor="nome" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Nome completo
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                  <Icon name="person" className="text-xl" />
                </span>
                <input
                  id="nome" type="text" autoComplete="name" required
                  placeholder="Seu nome completo"
                  value={form.name} onChange={e => set("name", e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-outline-variant bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* E-mail */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                E-mail
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                  <Icon name="mail" className="text-xl" />
                </span>
                <input
                  id="email" type="email" autoComplete="email" spellCheck={false} required
                  placeholder="seu@email.com"
                  value={form.email} onChange={e => set("email", e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-outline-variant bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Telefone */}
            <div>
              <label htmlFor="telefone" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Telefone
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                  <Icon name="phone" className="text-xl" />
                </span>
                <input
                  id="telefone" type="tel" autoComplete="tel"
                  placeholder="(11) 99999-9999"
                  value={form.phone} onChange={e => set("phone", e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-outline-variant bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Divider endereço */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1 h-px bg-outline-variant" />
              <span className="text-xs text-outline uppercase tracking-widest">Endereço</span>
              <div className="flex-1 h-px bg-outline-variant" />
            </div>

            {/* CEP + Estado */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="cep" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">CEP</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                    <Icon name="pin_drop" className="text-xl" />
                  </span>
                  <input
                    id="cep" type="text" autoComplete="postal-code" maxLength={9}
                    placeholder="00000-000"
                    value={form.zipCode} onChange={e => set("zipCode", e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-outline-variant bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-colors"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="estado" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Estado</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                    <Icon name="map" className="text-xl" />
                  </span>
                  <select
                    id="estado" autoComplete="address-level1"
                    value={form.state} onChange={e => set("state", e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-colors appearance-none"
                  >
                    <option value="" disabled>UF</option>
                    {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div>
              <label htmlFor="endereco" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Endereço</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                  <Icon name="home" className="text-xl" />
                </span>
                <input
                  id="endereco" type="text" autoComplete="street-address"
                  placeholder="Rua, número, complemento"
                  value={form.address} onChange={e => set("address", e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-outline-variant bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Cidade */}
            <div>
              <label htmlFor="cidade" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Cidade</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                  <Icon name="location_city" className="text-xl" />
                </span>
                <input
                  id="cidade" type="text" autoComplete="address-level2"
                  placeholder="Sua cidade"
                  value={form.city} onChange={e => set("city", e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-outline-variant bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="senha" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Senha</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                  <Icon name="lock" className="text-xl" />
                </span>
                <input
                  id="senha" type={showPassword ? "text" : "password"} autoComplete="new-password" spellCheck={false} required
                  placeholder="Mínimo 8 caracteres"
                  value={form.password} onChange={e => set("password", e.target.value)}
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

            {/* Confirmar senha */}
            <div>
              <label htmlFor="confirmar-senha" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Confirmar senha</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                  <Icon name="lock_reset" className="text-xl" />
                </span>
                <input
                  id="confirmar-senha" type="password" autoComplete="new-password" spellCheck={false} required
                  placeholder="Repita a senha"
                  value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-outline-variant bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Termos */}
            <div className="flex items-start gap-3 pt-1">
              <input
                id="termos" type="checkbox"
                checked={form.termos} onChange={e => set("termos", e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-yellow-500 cursor-pointer flex-shrink-0"
              />
              <label htmlFor="termos" className="text-sm text-on-surface-variant leading-relaxed cursor-pointer">
                Li e aceito os{" "}
                <Link href="#" className="text-primary font-semibold hover:underline">Termos de Uso</Link>{" "}
                e a{" "}
                <Link href="#" className="text-primary font-semibold hover:underline">Política de Privacidade</Link>
              </label>
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-black py-4 rounded-full transition-colors uppercase tracking-widest text-sm mt-2 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>Criar conta <Icon name="arrow_forward" /></>
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-outline-variant" />
            <span className="text-xs text-outline uppercase tracking-widest">ou continue com</span>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>

          {/* Google */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-outline-variant rounded-full py-3.5 hover:bg-surface-container transition-colors font-semibold text-sm text-on-surface"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Entrar com Google
          </button>

        </div>

        {/* Login link */}
        <p className="text-center text-sm text-on-surface-variant mt-6">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">Fazer login</Link>
        </p>

      </div>
    </div>
  );
}
