"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";

type Banner = {
  url: string;
  title?: string;
  subtitle?: string;
  link?: string;
  active: boolean;
  startsAt?: string; // ISO string ou ""
  endsAt?: string;   // ISO string ou ""
};

function bannerStatus(b: Banner): "active" | "scheduled" | "expired" | "draft" {
  const now = new Date();
  if (!b.active) return "draft";
  const start = b.startsAt ? new Date(b.startsAt) : null;
  const end   = b.endsAt   ? new Date(b.endsAt)   : null;
  if (end && end < now) return "expired";
  if (start && start > now) return "scheduled";
  return "active";
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active:    { label: "No ar",     color: "bg-green-500/10 text-green-400 border-green-500/20" },
  scheduled: { label: "Agendado",  color: "bg-blue-500/10 text-blue-400 border-blue-500/20"   },
  expired:   { label: "Expirado",  color: "bg-red-500/10 text-red-400 border-red-500/20"       },
  draft:     { label: "Rascunho",  color: "bg-white/5 text-neutral-400 border-white/10"        },
};

// Converte datetime-local string para ISO ou "" para salvar
function toISO(val: string) { return val ? new Date(val).toISOString() : ""; }
// Converte ISO para datetime-local input value
function toLocal(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function HeroBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/hero-banners")
      .then(r => r.json())
      .then((data: Banner[]) => setBanners(data.map(b => ({ active: false, ...b }))))
      .catch(() => {});
  }, []);

  async function upload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    const r = await fetch("/api/admin/hero-banners/upload", { method: "POST", body: fd });
    const d = await r.json();
    setUploading(false);
    if (d.url) setBanners(prev => [...prev, { url: d.url, title: "", subtitle: "", link: "", active: false, startsAt: "", endsAt: "" }]);
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

  function publish(i: number) {
    setBanners(prev => prev.map((b, idx) => idx === i ? { ...b, active: true, startsAt: "", endsAt: "" } : b));
  }

  function remove(i: number) {
    setBanners(prev => prev.filter((_, idx) => idx !== i));
  }

  function moveUp(i: number) {
    if (i === 0) return;
    setBanners(prev => { const a = [...prev]; [a[i-1], a[i]] = [a[i], a[i-1]]; return a; });
  }

  function moveDown(i: number) {
    setBanners(prev => { if (i >= prev.length-1) return prev; const a = [...prev]; [a[i], a[i+1]] = [a[i+1], a[i]]; return a; });
  }

  function update(i: number, field: keyof Banner, val: string | boolean) {
    setBanners(prev => prev.map((b, idx) => idx === i ? { ...b, [field]: val } : b));
  }

  function scheduleUpdate(i: number, field: "startsAt" | "endsAt", localVal: string) {
    const iso = toISO(localVal);
    setBanners(prev => prev.map((b, idx) => idx === i ? { ...b, [field]: iso, active: true } : b));
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Banners da Hero</h1>
          <p className="text-neutral-400 text-sm mt-1">Gerencie os banners rotativos da home. Proporção recomendada: 1920×600px.</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
        >
          <Icon name={saved ? "check" : "save"} className="text-base" />
          {saved ? "Salvo!" : saving ? "Salvando..." : "Salvar alterações"}
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

      {/* Lista */}
      {banners.length === 0 ? (
        <div className="text-center py-12 text-neutral-500 text-sm">Nenhum banner cadastrado. Faça upload acima.</div>
      ) : (
        <div className="space-y-4">
          {banners.map((b, i) => {
            const status = bannerStatus(b);
            const { label, color } = STATUS_LABELS[status];
            return (
              <div key={b.url + i} className="bg-[#111414] border border-white/5 rounded-2xl overflow-hidden">
                {/* Header do card */}
                <div className="flex items-center gap-4 p-4">
                  <img src={b.url} alt="" className="w-32 h-20 object-cover rounded-xl flex-shrink-0 bg-white/5" />

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${color}`}>{label}</span>
                    </div>
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
                    <input
                      value={b.link ?? ""}
                      onChange={e => update(i, "link", e.target.value)}
                      placeholder="Link ao clicar (ex: /busca ou https://...)"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500/50"
                    />
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

                {/* Controles de publicação */}
                <div className="border-t border-white/5 px-4 py-3 flex flex-wrap items-end gap-4">
                  {/* Publicar imediato */}
                  <button
                    onClick={() => publish(i)}
                    className={`flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-lg transition-colors ${
                      status === "active" && !b.startsAt && !b.endsAt
                        ? "bg-green-500/20 text-green-400 cursor-default"
                        : "bg-white/5 hover:bg-green-500/10 text-neutral-400 hover:text-green-400"
                    }`}
                  >
                    <Icon name="play_circle" className="text-sm" />
                    Publicar agora
                  </button>

                  {/* Agendar início */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Ativar em</label>
                    <input
                      type="datetime-local"
                      value={toLocal(b.startsAt)}
                      onChange={e => scheduleUpdate(i, "startsAt", e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500/50 [color-scheme:dark]"
                    />
                  </div>

                  {/* Agendar fim */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Sair do ar em</label>
                    <input
                      type="datetime-local"
                      value={toLocal(b.endsAt)}
                      onChange={e => scheduleUpdate(i, "endsAt", e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500/50 [color-scheme:dark]"
                    />
                  </div>

                  {/* Desativar */}
                  {b.active && (
                    <button
                      onClick={() => update(i, "active", false)}
                      className="flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition-colors"
                    >
                      <Icon name="pause_circle" className="text-sm" />
                      Desativar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
