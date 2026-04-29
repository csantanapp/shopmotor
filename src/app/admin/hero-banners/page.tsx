"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";

type Banner = { url: string; title?: string; subtitle?: string };

export default function HeroBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/hero-banners")
      .then(r => r.json())
      .then(setBanners)
      .catch(() => {});
  }, []);

  async function upload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    const r = await fetch("/api/admin/hero-banners/upload", { method: "POST", body: fd });
    const d = await r.json();
    setUploading(false);
    if (d.url) setBanners(prev => [...prev, { url: d.url, title: "", subtitle: "" }]);
    else alert(d.error ?? "Erro no upload.");
  }

  async function save() {
    setSaving(true);
    await fetch("/api/admin/hero-banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(banners),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function remove(i: number) {
    setBanners(prev => prev.filter((_, idx) => idx !== i));
  }

  function moveUp(i: number) {
    if (i === 0) return;
    setBanners(prev => { const a = [...prev]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return a; });
  }

  function moveDown(i: number) {
    setBanners(prev => { if (i >= prev.length - 1) return prev; const a = [...prev]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; return a; });
  }

  function update(i: number, field: "title" | "subtitle", val: string) {
    setBanners(prev => prev.map((b, idx) => idx === i ? { ...b, [field]: val } : b));
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Banners da Hero</h1>
          <p className="text-neutral-400 text-sm mt-1">Imagens exibidas em rotação na home. Proporção recomendada: 1920×600px.</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
        >
          <Icon name={saved ? "check" : "save"} className="text-base" />
          {saved ? "Salvo!" : saving ? "Salvando..." : "Salvar ordem"}
        </button>
      </div>

      {/* Upload */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-white/10 hover:border-yellow-500/50 rounded-2xl p-10 text-center cursor-pointer transition-colors mb-8 group"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }}
        />
        {uploading
          ? <p className="text-neutral-400 text-sm">Enviando...</p>
          : <>
              <Icon name="cloud_upload" className="text-4xl text-neutral-500 group-hover:text-yellow-500 transition-colors mb-2" />
              <p className="text-neutral-400 text-sm">Clique para fazer upload de um banner</p>
              <p className="text-neutral-600 text-xs mt-1">JPG, PNG ou WebP · Máx 5MB</p>
            </>
        }
      </div>

      {/* Lista de banners */}
      {banners.length === 0 ? (
        <div className="text-center py-12 text-neutral-500 text-sm">Nenhum banner cadastrado. Faça upload acima.</div>
      ) : (
        <div className="space-y-4">
          {banners.map((b, i) => (
            <div key={b.url + i} className="bg-[#111414] border border-white/5 rounded-2xl overflow-hidden flex gap-4 p-4 items-start">
              <img src={b.url} alt="" className="w-32 h-20 object-cover rounded-xl flex-shrink-0 bg-white/5" />
              <div className="flex-1 min-w-0 space-y-2">
                <input
                  value={b.title ?? ""}
                  onChange={e => update(i, "title", e.target.value)}
                  placeholder="Título (opcional)"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500/50"
                />
                <input
                  value={b.subtitle ?? ""}
                  onChange={e => update(i, "subtitle", e.target.value)}
                  placeholder="Subtítulo (opcional)"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500/50"
                />
                <p className="text-[10px] text-neutral-600 truncate">{b.url}</p>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button onClick={() => moveUp(i)} disabled={i === 0} className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-400 disabled:opacity-20 transition-colors">
                  <Icon name="arrow_upward" className="text-sm" />
                </button>
                <button onClick={() => moveDown(i)} disabled={i === banners.length - 1} className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-400 disabled:opacity-20 transition-colors">
                  <Icon name="arrow_downward" className="text-sm" />
                </button>
                <button onClick={() => remove(i)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition-colors">
                  <Icon name="delete" className="text-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
