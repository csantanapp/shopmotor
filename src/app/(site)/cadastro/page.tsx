"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/context/AuthContext";

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

function formatCNPJ(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  return d.replace(/^(\d{2})(\d)/, "$1.$2")
          .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
          .replace(/\.(\d{3})(\d)/, ".$1/$2")
          .replace(/(\d{4})(\d)/, "$1-$2");
}

const benefits = [
  {
    icon: "verified_user",
    title: "Anúncios verificados",
    text: "Mais segurança para comprar e vender.",
  },
  {
    icon: "sell",
    title: "As melhores oportunidades",
    text: "Milhares de veículos com preços imperdíveis.",
  },
  {
    icon: "handshake",
    title: "Negocie com confiança",
    text: "Conectamos você às melhores negociações.",
  },
  {
    icon: "bolt",
    title: "Rápido, fácil e gratuito",
    text: "Crie sua conta em poucos segundos.",
  },
];

export default function CadastroPage() {
  const { refresh } = useAuth();
  const router = useRouter();

  const [accountType, setAccountType] = useState<"PF" | "PJ">("PF");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", phone: "", sharePhone: false,
    zipCode: "", state: "", address: "", city: "",
    password: "", confirmPassword: "", termos: false,
    cnpj: "", companyName: "", tradeName: "",
  });

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) { setError("As senhas não coincidem."); return; }
    if (!form.termos) { setError("Aceite os Termos de Uso para continuar."); return; }
    if (accountType === "PJ" && !form.cnpj) { setError("Informe o CNPJ."); return; }
    if (accountType === "PJ" && !form.companyName) { setError("Informe a Razão Social."); return; }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, accountType }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Erro ao criar conta."); return; }

    await refresh();
    router.push("/perfil");
    router.refresh();
  }

  const inputCls = "w-full pl-12 pr-4 py-3.5 rounded-xl border border-outline-variant bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-colors";
  const labelCls = "block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── LEFT — Hero comercial ── */}
      <div
        className="relative lg:w-1/2 flex flex-col justify-between overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0c0f0f 0%, #111518 50%, #161b1b 100%)",
          minHeight: "340px",
        }}
      >
        {/* Glow decorativo */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #FFD709 0%, transparent 70%)", transform: "translate(-30%, -30%)" }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-5 pointer-events-none"
          style={{ background: "radial-gradient(circle, #FFD709 0%, transparent 70%)", transform: "translate(30%, 30%)" }} />

        <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-14 py-14 lg:py-20 gap-10">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 self-start">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FFD709] border border-[#FFD709]/30 rounded-full px-4 py-1.5">
              CRIE SUA CONTA
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black leading-[1.05] tracking-tighter text-white">
              O marketplace mais completo para{" "}
              <span style={{ color: "#FFD709" }}>comprar, vender e anunciar</span>{" "}
              veículos
            </h1>
            <p className="text-white/50 text-base leading-relaxed max-w-md">
              Junte-se a milhares de pessoas que já encontraram o veículo ideal ou fecharam grandes negócios.
            </p>
          </div>

          {/* Benefit cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="group rounded-2xl p-5 flex gap-4 items-start transition-all duration-300 cursor-default"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,215,9,0.12)",
                  backdropFilter: "blur(8px)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px rgba(255,215,9,0.15)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,215,9,0.35)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,215,9,0.12)";
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,215,9,0.12)" }}>
                  <Icon name={b.icon} className="text-lg" style={{ color: "#FFD709" }} />
                </div>
                <div>
                  <p className="text-white text-sm font-black leading-tight mb-1">{b.title}</p>
                  <p className="text-white/40 text-xs leading-relaxed">{b.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Rodapé do hero */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black tracking-tighter" style={{ color: "#FFD709" }}>SHOP</span>
            <span className="text-3xl font-black tracking-tighter text-white">MOTOR</span>
            <span className="text-white/20 text-xs ml-2">Rápido. Fácil. Vendido.</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT — Formulário ── */}
      <div className="lg:w-1/2 flex items-start justify-center bg-surface overflow-y-auto">
        <div className="w-full max-w-md px-6 py-12">

          <div className="text-center mb-10">
            <h2 className="text-4xl font-black uppercase tracking-tighter text-on-surface mb-2">Crie sua conta</h2>
            <p className="text-on-surface-variant text-sm">Compre, venda e anuncie veículos em um só lugar.</p>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl shadow-[0px_12px_40px_rgba(45,47,47,0.08)] p-8">

            {/* Google */}
            <a
              href="/api/auth/google?redirect=/perfil"
              className="w-full flex items-center justify-center gap-3 border border-outline-variant rounded-full py-3.5 hover:bg-surface-container transition-colors font-semibold text-sm text-on-surface mb-5"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Cadastrar com Google
            </a>

            <div className="flex items-center gap-4 mb-5">
              <div className="flex-1 h-px bg-outline-variant" />
              <span className="text-xs text-outline uppercase tracking-widest">ou preencha os dados</span>
              <div className="flex-1 h-px bg-outline-variant" />
            </div>

            {/* Seletor de tipo de conta */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {([
                { type: "PF", icon: "person", label: "Pessoa Física", sub: "Particular" },
                { type: "PJ", icon: "store",  label: "Loja / Empresa", sub: "CNPJ" },
              ] as const).map(opt => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setAccountType(opt.type)}
                  className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all ${accountType === opt.type ? "border-primary-container bg-primary-container/10" : "border-outline-variant hover:border-outline"}`}
                >
                  <Icon name={opt.icon} className={`text-2xl ${accountType === opt.type ? "text-primary" : "text-outline"}`} />
                  <span className={`text-sm font-black ${accountType === opt.type ? "text-on-surface" : "text-on-surface-variant"}`}>{opt.label}</span>
                  <span className="text-[11px] text-outline">{opt.sub}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              {error && (
                <div className="flex items-center gap-2 bg-error/10 text-error rounded-xl px-4 py-3 text-sm font-medium">
                  <Icon name="error" className="text-lg flex-shrink-0" />{error}
                </div>
              )}

              {/* ── Campos PJ ── */}
              {accountType === "PJ" && (
                <div className="space-y-4 p-4 bg-primary-container/5 rounded-2xl border border-primary-container/20">
                  <p className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                    <Icon name="store" className="text-sm" />Dados da empresa
                  </p>

                  <div>
                    <label className={labelCls}>CNPJ *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"><Icon name="business" className="text-xl" /></span>
                      <input
                        type="text" inputMode="numeric" required={accountType === "PJ"}
                        placeholder="00.000.000/0001-00"
                        value={form.cnpj}
                        onChange={e => set("cnpj", formatCNPJ(e.target.value))}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Razão Social *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"><Icon name="corporate_fare" className="text-xl" /></span>
                      <input
                        type="text" required={accountType === "PJ"}
                        placeholder="Nome jurídico da empresa"
                        value={form.companyName}
                        onChange={e => set("companyName", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Nome Fantasia</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"><Icon name="storefront" className="text-xl" /></span>
                      <input
                        type="text"
                        placeholder="Como a loja é conhecida"
                        value={form.tradeName}
                        onChange={e => set("tradeName", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Dados pessoais ── */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 h-px bg-outline-variant" />
                <span className="text-xs text-outline uppercase tracking-widest">
                  {accountType === "PJ" ? "Responsável" : "Dados pessoais"}
                </span>
                <div className="flex-1 h-px bg-outline-variant" />
              </div>

              <div>
                <label className={labelCls}>{accountType === "PJ" ? "Nome do responsável" : "Nome completo"}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"><Icon name="person" className="text-xl" /></span>
                  <input type="text" autoComplete="name" required placeholder="Seu nome completo"
                    value={form.name} onChange={e => set("name", e.target.value)} className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>E-mail</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"><Icon name="mail" className="text-xl" /></span>
                  <input type="email" autoComplete="email" spellCheck={false} required placeholder="seu@email.com"
                    value={form.email} onChange={e => set("email", e.target.value)} className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>{accountType === "PJ" ? "Telefone comercial" : "Telefone"}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"><Icon name="phone" className="text-xl" /></span>
                  <input type="tel" autoComplete="tel" placeholder="(11) 99999-9999"
                    value={form.phone} onChange={e => set("phone", e.target.value)} className={inputCls} />
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <div className="relative mt-0.5">
                  <input type="checkbox" checked={form.sharePhone} onChange={e => set("sharePhone", e.target.checked)} className="sr-only peer" />
                  <div className="w-10 h-6 bg-outline-variant rounded-full peer-checked:bg-primary-container transition-colors" />
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Exibir telefone no chat</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Seu número ficará visível para compradores nas conversas.</p>
                </div>
              </label>

              {/* Endereço */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 h-px bg-outline-variant" />
                <span className="text-xs text-outline uppercase tracking-widest">Endereço</span>
                <div className="flex-1 h-px bg-outline-variant" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>CEP</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"><Icon name="pin_drop" className="text-xl" /></span>
                    <input type="text" autoComplete="postal-code" maxLength={9} placeholder="00000-000"
                      value={form.zipCode} onChange={e => set("zipCode", e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Estado</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"><Icon name="map" className="text-xl" /></span>
                    <select autoComplete="address-level1" value={form.state} onChange={e => set("state", e.target.value)}
                      className={inputCls + " appearance-none"}>
                      <option value="" disabled>UF</option>
                      {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Endereço</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"><Icon name="home" className="text-xl" /></span>
                  <input type="text" autoComplete="street-address" placeholder="Rua, número, complemento"
                    value={form.address} onChange={e => set("address", e.target.value)} className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Cidade</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"><Icon name="location_city" className="text-xl" /></span>
                  <input type="text" autoComplete="address-level2" placeholder="Sua cidade"
                    value={form.city} onChange={e => set("city", e.target.value)} className={inputCls} />
                </div>
              </div>

              {/* Senha */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 h-px bg-outline-variant" />
                <span className="text-xs text-outline uppercase tracking-widest">Senha</span>
                <div className="flex-1 h-px bg-outline-variant" />
              </div>

              <div>
                <label className={labelCls}>Senha</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"><Icon name="lock" className="text-xl" /></span>
                  <input id="senha" type={showPassword ? "text" : "password"} autoComplete="new-password" spellCheck={false} required
                    placeholder="Mínimo 8 caracteres"
                    value={form.password} onChange={e => set("password", e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-outline-variant bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-colors" />
                  <button type="button" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                    <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-xl" />
                  </button>
                </div>
              </div>

              <div>
                <label className={labelCls}>Confirmar senha</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"><Icon name="lock_reset" className="text-xl" /></span>
                  <input type="password" autoComplete="new-password" spellCheck={false} required placeholder="Repita a senha"
                    value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} className={inputCls} />
                </div>
              </div>

              {/* Termos */}
              <div className="flex items-start gap-3 pt-1">
                <input id="termos" type="checkbox" checked={form.termos} onChange={e => set("termos", e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-yellow-500 cursor-pointer flex-shrink-0" />
                <label htmlFor="termos" className="text-sm text-on-surface-variant leading-relaxed cursor-pointer">
                  Li e aceito os{" "}
                  <Link href="/termos" target="_blank" className="text-primary font-semibold hover:underline">Termos de Uso</Link>{" "}
                  e a{" "}
                  <Link href="/privacidade" target="_blank" className="text-primary font-semibold hover:underline">Política de Privacidade</Link>
                </label>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-black py-4 rounded-full transition-colors uppercase tracking-widest text-sm mt-2 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />Criando conta...</>
                ) : (
                  <>{accountType === "PJ" ? "Criar conta da loja" : "Criar conta"} <Icon name="arrow_forward" /></>
                )}
              </button>

            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-outline-variant" />
              <span className="text-xs text-outline uppercase tracking-widest">já tem conta?</span>
              <div className="flex-1 h-px bg-outline-variant" />
            </div>

            <Link href="/login"
              className="w-full flex items-center justify-center gap-2 border border-outline-variant rounded-full py-3.5 hover:bg-surface-container transition-colors font-semibold text-sm text-on-surface">
              <Icon name="login" className="text-base" />
              Fazer login
            </Link>

          </div>
        </div>
      </div>

    </div>
  );
}
