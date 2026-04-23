"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

interface StoreData {
  storeSlug: string;
  storeDescription: string | null;
  storeBannerUrl: string | null;
  avatarUrl: string | null;
  name: string;
  tradeName: string | null;
  companyName: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  sharePhone: boolean;
}

export default function LojaPage() {
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    storeDescription: "",
    tradeName: "",
    phone: "",
    sharePhone: false,
  });

  useEffect(() => {
    fetch("/api/user/store")
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        setStore(d.store);
        setForm({
          storeDescription: d.store.storeDescription ?? "",
          tradeName: d.store.tradeName ?? "",
          phone: d.store.phone ?? "",
          sharePhone: d.store.sharePhone ?? false,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    setSaving(true);
    const res = await fetch("/api/user/store", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) { setError("Erro ao salvar."); return; }
    setSuccess("Alteracoes salvas!");
    setTimeout(() => setSuccess(""), 3000);
  }



  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const fd = new FormData();
    fd.append("avatar", file);
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
      <p className="font-black text-on-surface">Recurso disponivel apenas para contas Loja (PJ).</p>
      <Link href="/perfil/conta" className="text-primary font-bold hover:underline text-sm">Ir para Minha Conta</Link>
    </div>
  );

  const storeUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/loja/${store.storeSlug}`;

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-on-surface uppercase">Minha Loja</h1>
          <p className="text-on-surface-variant text-sm mt-1">Personalize a pagina publica da sua loja.</p>
        </div>
        <a
          href={`/loja/${store.storeSlug}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-sm font-bold text-primary border border-primary/30 px-5 py-2.5 rounded-full hover:bg-primary/5 transition-colors"
        >
          <Icon name="open_in_new" className="text-base" />
          Ver pagina da loja
        </a>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-error/10 text-error rounded-xl px-4 py-3 text-sm font-medium">
          <Icon name="error" className="text-lg flex-shrink-0" />{error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
          <Icon name="check_circle" className="text-lg flex-shrink-0" />{success}
        </div>
      )}

      {/* Banner */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
        <div className="relative h-44 bg-gradient-to-br from-inverse-surface to-neutral-700 flex items-center justify-center gap-3">
          <Icon name="image_not_supported" className="text-3xl text-white/30" />
          <span className="text-sm text-white/40 font-bold">Banner em breve</span>
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-4">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-full border-4 border-surface bg-surface-container overflow-hidden flex items-center justify-center cursor-pointer shadow-lg"
                onClick={() => logoRef.current?.click()}
              >
                {store.avatarUrl ? (
                  <img src={store.avatarUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-on-surface-variant">
                    {(store.tradeName || store.name).charAt(0).toUpperCase()}
                  </span>
                )}
                {uploadingLogo && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => logoRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-container rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform"
              >
                <Icon name="photo_camera" className="text-xs text-on-primary-container" />
              </button>
              <input ref={logoRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLogoUpload} />
            </div>
            <div className="pb-1">
              <p className="font-black text-on-surface text-lg">{store.tradeName || store.companyName || store.name}</p>
              <p className="text-xs text-on-surface-variant font-mono">/loja/{store.storeSlug}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-8 space-y-5">
          <h2 className="text-base font-bold border-b border-neutral-100 pb-4">Informacoes da loja</h2>

          <Field label="Nome Fantasia" value={form.tradeName} onChange={v => setForm(p => ({ ...p, tradeName: v }))} placeholder="Nome exibido na pagina da loja" />

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Descricao da loja</label>
            <textarea
              value={form.storeDescription}
              onChange={e => setForm(p => ({ ...p, storeDescription: e.target.value }))}
              rows={4}
              maxLength={500}
              placeholder="Conte sobre sua loja, especialidades, diferenciais..."
              className="bg-surface-container-low border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none resize-none"
            />
            <p className="text-xs text-outline text-right">{form.storeDescription.length}/500</p>
          </div>

          <Field label="Telefone / WhatsApp" value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v }))} type="tel" placeholder="(00) 00000-0000" />

          <div className="flex items-center gap-3">
            <input
              id="sharePhone" type="checkbox" checked={form.sharePhone}
              onChange={e => setForm(p => ({ ...p, sharePhone: e.target.checked }))}
              className="w-4 h-4 rounded accent-yellow-500 cursor-pointer"
            />
            <label htmlFor="sharePhone" className="text-sm text-on-surface-variant cursor-pointer">
              Exibir telefone na pagina da loja
            </label>
          </div>
        </div>

        {/* URL da loja */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-8 space-y-3">
          <h2 className="text-base font-bold border-b border-neutral-100 pb-4">Link da sua loja</h2>
          <div className="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-3">
            <Icon name="link" className="text-outline text-xl flex-shrink-0" />
            <span className="text-sm font-mono text-on-surface-variant break-all">{storeUrl}</span>
          </div>
          <p className="text-xs text-on-surface-variant">Este e o link publico da sua loja. Compartilhe com seus clientes.</p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary-container text-on-primary-container px-12 py-3 rounded-full font-black uppercase tracking-widest text-sm shadow-[0px_8px_24px_rgba(255,215,9,0.25)] hover:-translate-y-0.5 transition-all disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <span className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />}
            Salvar alteracoes
          </button>
        </div>
      </form>

    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="bg-surface-container-low border-0 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none"
      />
    </div>
  );
}
