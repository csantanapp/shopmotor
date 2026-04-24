"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { STORE_PLANS, StorePlan } from "@/lib/store-plans";

// ── Types ─────────────────────────────────────────────────────────────────────

interface StoreData {
  storeSlug: string; storeDescription: string | null; storeBannerUrl: string | null;
  avatarUrl: string | null; name: string; tradeName: string | null; companyName: string | null;
  city: string | null; state: string | null; phone: string | null; sharePhone: boolean;
}
interface Subscription { plan: StorePlan; status: string; endsAt: string; }
interface AnalyticsData {
  total: number; last30Total: number; uniqueSessions: number;
  days: { date: string; views: number }[];
  devices: { device: string; count: number; pct: number }[];
  sources: { source: string; count: number }[];
  topVehicles: { id: string; brand: string; model: string; version: string | null; yearModel: number; views30d: number }[];
  plan: string;
}

// ── Sparkline ─────────────────────────────────────────────────────────────────

function Sparkline({ data }: { data: { views: number }[] }) {
  const pts = data.map(d => d.views);
  const max = Math.max(...pts, 1);
  const w = 400; const h = 72;
  const path = pts.map((v, i) => `${i === 0 ? "M" : "L"} ${(i / (pts.length - 1)) * w} ${h - (v / max) * (h - 6)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eab308" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill="url(#sg)" />
      <path d={path} fill="none" stroke="#eab308" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ── Field helpers ─────────────────────────────────────────────────────────────

function Field({ label, value, onChange, type = "text", placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="bg-surface-container-low border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none" />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function LojaPage() {
  const [store, setStore] = useState<StoreData | null>(null);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [tab, setTab] = useState<"info" | "social" | "analytics">("info");
  const [socialForm, setSocialForm] = useState({ instagram: "", facebook: "", youtube: "", tiktok: "" });
  const [savingSocial, setSavingSocial] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    storeDescription: "", tradeName: "", phone: "", sharePhone: false,
  });

  const planConfig = sub ? STORE_PLANS[sub.plan] : null;
  const hasAnalytics = planConfig?.analytics ?? false;
  const hasSocial = planConfig?.socialLinks ?? false;

  useEffect(() => {
    Promise.all([
      fetch("/api/user/store").then(r => r.ok ? r.json() : null),
      fetch("/api/payments/subscription").then(r => r.ok ? r.json() : null),
    ]).then(([storeData, subData]) => {
      if (storeData?.store) {
        setStore(storeData.store);
        setForm({
          storeDescription: storeData.store.storeDescription ?? "",
          tradeName: storeData.store.tradeName ?? "",
          phone: storeData.store.phone ?? "",
          sharePhone: storeData.store.sharePhone ?? false,
        });
      }
      if (subData?.subscription?.status === "active") setSub(subData.subscription);
      setLoading(false);
    });
  }, []);

  const loadAnalytics = useCallback(() => {
    if (!hasAnalytics || analyticsLoading) return;
    setAnalyticsLoading(true);
    fetch("/api/perfil/analytics")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setAnalytics(d); setAnalyticsLoading(false); })
      .catch(() => setAnalyticsLoading(false));
  }, [hasAnalytics, analyticsLoading]);

  useEffect(() => {
    if (tab === "analytics" && hasAnalytics && !analytics) loadAnalytics();
  }, [tab, hasAnalytics, analytics, loadAnalytics]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(""); setSaving(true);
    const res = await fetch("/api/user/store", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) { setError("Erro ao salvar."); return; }
    setSuccess("Alterações salvas!"); setTimeout(() => setSuccess(""), 3000);
  }

  async function handleSaveSocial(e: React.FormEvent) {
    e.preventDefault();
    setSavingSocial(true);
    await fetch("/api/user/store", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ social: socialForm }),
    });
    setSavingSocial(false);
    setSuccess("Redes sociais salvas!"); setTimeout(() => setSuccess(""), 3000);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingLogo(true);
    const fd = new FormData(); fd.append("avatar", file);
    const res = await fetch("/api/user/avatar", { method: "POST", body: fd });
    const data = await res.json();
    setUploadingLogo(false);
    if (res.ok) setStore(prev => prev ? { ...prev, avatarUrl: data.avatarUrl } : prev);
    else setError(data.error ?? "Erro ao enviar logo.");
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="w-8 h-8 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
    </div>
  );

  if (!store) return (
    <div className="text-center py-16 space-y-4">
      <Icon name="store_off" className="text-5xl text-outline mx-auto" />
      <p className="font-black text-on-surface">Recurso disponível apenas para contas Loja (PJ).</p>
      <Link href="/perfil/conta" className="text-primary font-bold hover:underline text-sm">Ir para Minha Conta</Link>
    </div>
  );

  const storeUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/loja/${store.storeSlug}`;
  const planBadge = planConfig
    ? { label: `${planConfig.emoji} ${planConfig.name}`, cls: sub?.plan === "ELITE" ? "bg-orange-500/15 text-orange-600" : sub?.plan === "PRO" ? "bg-yellow-500/15 text-yellow-700" : "bg-zinc-100 text-zinc-500" }
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* ── HEADER ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black tracking-tighter text-on-surface uppercase">Minha Loja</h1>
            {planBadge && (
              <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${planBadge.cls}`}>{planBadge.label}</span>
            )}
          </div>
          <p className="text-on-surface-variant text-sm mt-0.5">Personalize a página pública da sua loja</p>
        </div>
        <div className="flex gap-2">
          <a href={`/loja/${store.storeSlug}`} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 text-sm font-bold text-on-surface-variant border border-outline-variant px-4 py-2 rounded-full hover:bg-surface-container transition-colors">
            <Icon name="open_in_new" className="text-base" /> Ver loja
          </a>
          {sub && (
            <Link href="/perfil/plano"
              className="flex items-center gap-2 text-sm font-black bg-primary-container text-on-primary-container px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
              <Icon name="card_membership" className="text-base" />
              R$ {planConfig?.price?.toLocaleString("pt-BR")}/mês
            </Link>
          )}
        </div>
      </div>

      {/* ── STATUS CARDS ── */}
      {sub && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Veículos ativos", value: "—", icon: "directions_car", color: "text-on-surface", load: true },
            { label: `Destaques (${planConfig?.destaques ?? 0}/mês)`, value: String(planConfig?.destaques ?? 0), icon: "bolt", color: "text-yellow-600" },
            { label: "Visualizações (30d)", value: analytics ? analytics.last30Total.toLocaleString("pt-BR") : hasAnalytics ? "..." : "—", icon: "visibility", color: hasAnalytics ? "text-blue-600" : "text-on-surface-variant", locked: !hasAnalytics },
          ].map(stat => (
            <VehicleCountCard key={stat.label} stat={stat} storeSlug={store.storeSlug} analytics={analytics} hasAnalytics={hasAnalytics} />
          ))}
        </div>
      )}

      {/* Feedback */}
      {error && <div className="flex items-center gap-2 bg-error/10 text-error rounded-xl px-4 py-3 text-sm"><Icon name="error" className="text-lg flex-shrink-0" />{error}</div>}
      {success && <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-4 py-3 text-sm"><Icon name="check_circle" className="text-lg flex-shrink-0" />{success}</div>}

      {/* ── TABS ── */}
      <div className="flex gap-1 bg-surface-container rounded-xl p-1 w-fit">
        {([
          { key: "info",      label: "Informações",  icon: "edit" },
          { key: "social",    label: "Redes Sociais", icon: "share",    locked: !hasSocial },
          { key: "analytics", label: "Analytics",     icon: "bar_chart", locked: !hasAnalytics },
        ] as { key: "info"|"social"|"analytics"; label: string; icon: string; locked?: boolean }[]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === t.key ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"
            }`}>
            <Icon name={t.icon} className="text-base" />
            {t.label}
            {t.locked && <Icon name="lock" className="text-outline text-xs" />}
          </button>
        ))}
      </div>

      {/* ── TAB: INFORMAÇÕES ── */}
      {tab === "info" && (
        <>
          {/* Perfil visual */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
            <div className="relative h-36 bg-gradient-to-br from-inverse-surface to-neutral-700 flex items-center justify-center gap-3">
              <Icon name="image_not_supported" className="text-3xl text-white/20" />
              <span className="text-sm text-white/30 font-bold">Banner em breve</span>
            </div>
            <div className="px-6 pb-6">
              <div className="flex items-end gap-4 -mt-8 mb-4">
                <div className="relative">
                  <div onClick={() => logoRef.current?.click()}
                    className="w-16 h-16 rounded-full border-4 border-surface bg-surface-container overflow-hidden flex items-center justify-center cursor-pointer shadow-lg">
                    {store.avatarUrl ? (
                      <img src={store.avatarUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-black text-on-surface-variant">{(store.tradeName || store.name).charAt(0).toUpperCase()}</span>
                    )}
                    {uploadingLogo && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>}
                  </div>
                  <button type="button" onClick={() => logoRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-container rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform">
                    <Icon name="photo_camera" className="text-xs text-on-primary-container" />
                  </button>
                  <input ref={logoRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLogoUpload} />
                </div>
                <div className="pb-1">
                  <p className="font-black text-on-surface text-base">{store.tradeName || store.companyName || store.name}</p>
                  <p className="text-xs text-on-surface-variant font-mono">/loja/{store.storeSlug}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSave} className="space-y-5">
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 space-y-5">
              <h2 className="text-sm font-bold border-b border-neutral-100 pb-3">Informações da loja</h2>
              <Field label="Nome Fantasia" value={form.tradeName} onChange={v => setForm(p => ({ ...p, tradeName: v }))} placeholder="Nome exibido na loja" />
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Descrição da loja</label>
                <textarea value={form.storeDescription} onChange={e => setForm(p => ({ ...p, storeDescription: e.target.value }))}
                  rows={4} maxLength={500} placeholder="Especialidades, diferenciais, tempo de mercado..."
                  className="bg-surface-container-low border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none resize-none" />
                <p className="text-xs text-outline text-right">{form.storeDescription.length}/500</p>
              </div>
              <Field label="Telefone / WhatsApp" value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v }))} type="tel" placeholder="(00) 00000-0000" />
              <div className="flex items-center gap-3">
                <input id="sharePhone" type="checkbox" checked={form.sharePhone}
                  onChange={e => setForm(p => ({ ...p, sharePhone: e.target.checked }))}
                  className="w-4 h-4 rounded accent-yellow-500 cursor-pointer" />
                <label htmlFor="sharePhone" className="text-sm text-on-surface-variant cursor-pointer">Exibir telefone na página da loja</label>
              </div>
            </div>

            {/* URL */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 space-y-3">
              <h2 className="text-sm font-bold border-b border-neutral-100 pb-3">Link público da loja</h2>
              <div className="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-3">
                <Icon name="link" className="text-outline text-xl flex-shrink-0" />
                <span className="text-sm font-mono text-on-surface-variant break-all flex-1">{storeUrl}</span>
                <button type="button" onClick={() => navigator.clipboard?.writeText(storeUrl)}
                  className="text-outline hover:text-on-surface transition-colors"><Icon name="content_copy" className="text-base" /></button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={saving}
                className="bg-primary-container text-on-primary-container px-10 py-3 rounded-full font-black uppercase tracking-widest text-sm shadow-[0px_8px_24px_rgba(255,215,9,0.25)] hover:-translate-y-0.5 transition-all disabled:opacity-60 flex items-center gap-2">
                {saving && <span className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />}
                Salvar alterações
              </button>
            </div>
          </form>
        </>
      )}

      {/* ── TAB: REDES SOCIAIS ── */}
      {tab === "social" && (
        <div className="relative">
          <div className={`bg-surface-container-lowest rounded-2xl shadow-sm p-6 space-y-5 ${!hasSocial ? "opacity-40 pointer-events-none select-none" : ""}`}>
            <h2 className="text-sm font-bold border-b border-neutral-100 pb-3">Links das redes sociais</h2>
            <p className="text-xs text-on-surface-variant">Estes links aparecem no hero da sua vitrine pública.</p>
            {[
              { key: "instagram", label: "Instagram", placeholder: "https://www.instagram.com/suapagina", color: "from-purple-500 to-pink-500", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
              { key: "facebook",  label: "Facebook",  placeholder: "https://www.facebook.com/suapagina",  color: "from-blue-600 to-blue-700",   icon: "M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.887v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" },
              { key: "youtube",   label: "YouTube",   placeholder: "https://www.youtube.com/@seucanal",   color: "from-red-500 to-red-600",     icon: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
              { key: "tiktok",    label: "TikTok",    placeholder: "https://www.tiktok.com/@suapagina",   color: "from-zinc-900 to-zinc-700",   icon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" },
            ].map(s => (
              <div key={s.key} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d={s.icon} /></svg>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400">{s.label}</label>
                  <input type="url" value={socialForm[s.key as keyof typeof socialForm]}
                    onChange={e => setSocialForm(p => ({ ...p, [s.key]: e.target.value }))}
                    placeholder={s.placeholder}
                    className="block w-full bg-surface-container-low border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container outline-none mt-0.5" />
                </div>
              </div>
            ))}
            <form onSubmit={handleSaveSocial} className="flex justify-end pt-2">
              <button type="submit" disabled={savingSocial}
                className="bg-primary-container text-on-primary-container font-black px-8 py-2.5 rounded-full text-sm flex items-center gap-2 disabled:opacity-60">
                {savingSocial && <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />}
                Salvar redes
              </button>
            </form>
          </div>
          {!hasSocial && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] rounded-2xl flex flex-col items-center justify-center gap-2">
              <Icon name="lock" className="text-2xl text-zinc-400" />
              <p className="text-xs font-black text-zinc-500">Disponível no plano Pro+</p>
              <Link href="/perfil/plano" className="text-xs font-black text-yellow-600 underline">Fazer upgrade</Link>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: ANALYTICS ── */}
      {tab === "analytics" && (
        <div className="relative">
          <div className={`space-y-5 ${!hasAnalytics ? "opacity-30 pointer-events-none select-none" : ""}`}>

            {analyticsLoading ? (
              <div className="flex items-center justify-center py-16">
                <span className="w-8 h-8 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
              </div>
            ) : analytics ? (
              <>
                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Visitas (30d)",  value: analytics.last30Total.toLocaleString("pt-BR"), icon: "visibility" },
                    { label: "Sessões únicas", value: analytics.uniqueSessions.toLocaleString("pt-BR"), icon: "person" },
                    { label: "Total histórico", value: analytics.total.toLocaleString("pt-BR"), icon: "bar_chart" },
                    { label: "Anúncios rastr.", value: String(analytics.topVehicles.length), icon: "directions_car" },
                  ].map(k => (
                    <div key={k.label} className="bg-surface-container-lowest rounded-2xl border border-neutral-100 shadow-sm p-4">
                      <Icon name={k.icon} className="text-primary text-xl mb-2" />
                      <p className="text-2xl font-black text-on-surface">{k.value}</p>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">{k.label}</p>
                    </div>
                  ))}
                </div>

                {/* Gráfico 30 dias */}
                <div className="bg-surface-container-lowest rounded-2xl border border-neutral-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-black text-on-surface">Visitas últimos 30 dias</h3>
                    <span className="text-xs text-on-surface-variant">Atualizado hoje</span>
                  </div>
                  <div className="h-20">
                    <Sparkline data={analytics.days} />
                  </div>
                </div>

                {/* Dispositivos + Origens */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface-container-lowest rounded-2xl border border-neutral-100 shadow-sm p-5">
                    <h3 className="text-sm font-black text-on-surface mb-4">Dispositivos</h3>
                    <div className="space-y-3">
                      {analytics.devices.length === 0
                        ? <p className="text-xs text-on-surface-variant">Sem dados ainda</p>
                        : analytics.devices.map(d => (
                        <div key={d.device}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-on-surface-variant capitalize">{d.device ?? "Desktop"}</span>
                            <span className="font-black text-on-surface">{d.pct}%</span>
                          </div>
                          <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                            <div className="h-full bg-primary-container rounded-full transition-all" style={{ width: `${d.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest rounded-2xl border border-neutral-100 shadow-sm p-5">
                    <h3 className="text-sm font-black text-on-surface mb-4">Origens</h3>
                    <div className="space-y-2.5">
                      {analytics.sources.length === 0
                        ? <p className="text-xs text-on-surface-variant">Sem dados ainda</p>
                        : analytics.sources.map(s => (
                        <div key={s.source} className="flex items-center gap-2 text-sm">
                          <Icon name="link" className="text-on-surface-variant text-base flex-shrink-0" />
                          <span className="text-on-surface-variant flex-1 truncate">{s.source}</span>
                          <span className="font-black text-on-surface">{s.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Anúncios mais vistos */}
                <div className="bg-surface-container-lowest rounded-2xl border border-neutral-100 shadow-sm p-5">
                  <h3 className="text-sm font-black text-on-surface mb-4">Anúncios mais vistos (30d)</h3>
                  {analytics.topVehicles.length === 0 ? (
                    <p className="text-xs text-on-surface-variant">Nenhum dado registrado ainda. As visitas aparecerão aqui conforme os anúncios forem acessados.</p>
                  ) : (
                    <div className="divide-y divide-neutral-100">
                      {analytics.topVehicles.map((v, i) => (
                        <div key={v.id} className="flex items-center gap-3 py-3">
                          <span className="text-xs font-black text-on-surface-variant w-4">{i + 1}</span>
                          <Link href={`/carro/${v.id}`} target="_blank"
                            className="text-sm text-on-surface flex-1 hover:text-primary transition-colors">
                            {v.brand} {v.model}{v.version ? ` ${v.version}` : ""} {v.yearModel}
                          </Link>
                          <span className="text-xs font-black text-on-surface">{v.views30d} vis.</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-surface-container-lowest rounded-2xl border border-neutral-100 p-8 text-center">
                <Icon name="bar_chart" className="text-4xl text-outline mb-3" />
                <p className="text-sm text-on-surface-variant">Carregando analytics...</p>
              </div>
            )}
          </div>

          {!hasAnalytics && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] rounded-2xl flex flex-col items-center justify-center gap-2">
              <Icon name="lock" className="text-2xl text-zinc-400" />
              <p className="text-xs font-black text-zinc-500">Disponível no plano Pro+</p>
              <Link href="/perfil/plano" className="text-xs font-black text-yellow-600 underline">Fazer upgrade</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Componente separado para buscar contagem de veículos
function VehicleCountCard({ stat, storeSlug, analytics, hasAnalytics }: {
  stat: { label: string; value: string; icon: string; color: string; locked?: boolean; load?: boolean };
  storeSlug: string; analytics: AnalyticsData | null; hasAnalytics: boolean;
}) {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    if (!stat.load) return;
    fetch(`/api/loja/${storeSlug}`).then(r => r.ok ? r.json() : null).then(d => {
      if (d?.store?._count?.vehicles != null) setCount(d.store._count.vehicles);
    }).catch(() => null);
  }, [stat.load, storeSlug]);

  const displayValue = stat.load ? (count !== null ? String(count) : "...") : stat.value;

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-neutral-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <Icon name={stat.icon} className={`text-xl ${stat.locked ? "text-outline" : stat.color}`} />
        {stat.locked && <Icon name="lock" className="text-outline text-sm" />}
      </div>
      <p className={`text-2xl font-black ${stat.locked ? "text-outline" : stat.color}`}>{displayValue}</p>
      <p className="text-[11px] text-on-surface-variant mt-0.5">{stat.label}</p>
    </div>
  );
}
