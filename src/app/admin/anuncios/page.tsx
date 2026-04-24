"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Icon from "@/components/ui/Icon";

const SLOTS = [
  { value: "home_topbar",  label: "Home — Barra de aviso (topo)",      desc: "Faixa acima do menu, fixada no topo do site.", dimensions: "Largura: 100% da tela · Altura: 40px (fixa)" },
  { value: "home_banner",  label: "Home — Banner acima dos anúncios",  desc: "Banner exibido entre as categorias e a grade de veículos da home.", dimensions: "Largura: ~1500px (100% do container) · Altura: 350px" },
  { value: "busca_banner", label: "Busca — Banner acima dos resultados", desc: "Banner no topo da coluna de resultados na página de busca.", dimensions: "Largura: ~1100px (coluna de resultados) · Altura: 350px" },
  { value: "busca_card",   label: "Busca — Card patrocinado na grade", desc: "Card na posição 9 da grade de resultados, visual idêntico ao card de veículo.", dimensions: "Largura: ~280px (card padrão) · Altura: ~340px" },
  { value: "home_popup",   label: "Home — Pop-up com temporizador",    desc: "Modal pop-up centralizado na home. Aparece após X segundos, uma vez por sessão.", dimensions: "Largura: 448px (max) · Altura: variável conforme conteúdo" },
];

const EMPTY = {
  slot: "home_topbar", active: false,
  title: "", subtitle: "", imageUrl: "", linkUrl: "", linkLabel: "",
  bgColor: "#e63946", textColor: "#ffffff", popupDelay: 0,
  startsAt: "", endsAt: "",
};

function ImageUpload({ value, onChange, fixedHeight }: { value: string; onChange: (url: string) => void; fixedHeight?: number }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const upload = useCallback(async (file: File) => {
    setError("");
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) { setError("Formato inválido. Use JPG, PNG, WebP ou GIF."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Arquivo muito grande. Máximo 5MB."); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    const res = await fetch("/api/admin/ads/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.url) onChange(data.url);
    else setError(data.error ?? "Erro ao fazer upload.");
  }, [onChange]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  return (
    <div>
      <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Imagem</label>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors overflow-hidden ${
          dragging ? "border-primary-container bg-primary-container/10" : "border-white/10 hover:border-white/20 bg-white/[0.02]"
        }`}
        style={fixedHeight ? { height: fixedHeight, minHeight: fixedHeight, maxHeight: fixedHeight, resize: "none" } : { minHeight: 100 }}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-neutral-500">Enviando...</p>
          </div>
        ) : value ? (
          <div className="flex items-center gap-4 w-full">
            <img src={value} alt="preview" className="h-20 w-32 object-cover rounded-lg flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-400 truncate">{value}</p>
              <p className="text-xs text-neutral-600 mt-1">Clique ou arraste para trocar</p>
            </div>
            <button onClick={e => { e.stopPropagation(); onChange(""); }} className="text-neutral-500 hover:text-red-400 transition-colors flex-shrink-0">
              <Icon name="delete" className="text-lg" />
            </button>
          </div>
        ) : (
          <>
            <Icon name="cloud_upload" className="text-3xl text-neutral-500" />
            <p className="text-sm text-neutral-400 font-semibold">Arraste ou clique para enviar</p>
            <p className="text-xs text-neutral-600">JPG, PNG, WebP, GIF — máx. 5MB</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }}
        />
      </div>

      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}

      {/* Manual URL fallback */}
      <div className="mt-2">
        <input
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-neutral-400 outline-none focus:border-primary-container placeholder:text-neutral-600"
          placeholder="Ou cole uma URL de imagem..."
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export default function AdminAnuncios() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/ads").then(r => r.json()).then(d => { setAds(d); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(EMPTY); setEditing("new"); };
  const openEdit = (ad: any) => { setForm({ ...ad }); setEditing(ad.id); };
  const closeEditor = () => setEditing(null);

  const save = async () => {
    setSaving(true);
    const isNew = editing === "new";
    const url   = isNew ? "/api/admin/ads" : `/api/admin/ads/${editing}`;
    const method = isNew ? "POST" : "PUT";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    setEditing(null);
    load();
  };

  const toggle = async (ad: any) => {
    await fetch(`/api/admin/ads/${ad.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !ad.active }),
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este anúncio?")) return;
    await fetch(`/api/admin/ads/${id}`, { method: "DELETE" });
    load();
  };

  const slotMeta = (slot: string) => SLOTS.find(s => s.value === slot);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Anúncios Parceiros</h1>
          <p className="text-neutral-500 text-sm mt-1">Gerencie os espaços publicitários do portal</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 bg-primary-container text-on-primary-container font-black text-sm rounded-xl hover:opacity-90 transition-opacity">
          <Icon name="add" className="text-base" />
          Novo anúncio
        </button>
      </div>

      {/* Slot reference */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {SLOTS.map(s => (
          <div key={s.value} className="bg-[#111414] border border-white/5 rounded-xl p-4">
            <p className="text-xs font-black text-neutral-400 mb-1">{s.label}</p>
            <p className="text-xs text-neutral-600">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Ads list */}
      <div className="bg-[#111414] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-6 py-3 text-xs font-black text-neutral-500 uppercase tracking-widest">Slot</th>
              <th className="text-left px-6 py-3 text-xs font-black text-neutral-500 uppercase tracking-widest">Título</th>
              <th className="text-left px-6 py-3 text-xs font-black text-neutral-500 uppercase tracking-widest">Período</th>
              <th className="text-left px-6 py-3 text-xs font-black text-neutral-500 uppercase tracking-widest">Status</th>
              <th className="text-left px-6 py-3 text-xs font-black text-neutral-500 uppercase tracking-widest">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10 text-neutral-600">Carregando...</td></tr>
            ) : ads.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-neutral-600">Nenhum anúncio cadastrado.</td></tr>
            ) : ads.map((ad: any) => (
              <tr key={ad.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <p className="text-xs font-bold text-neutral-300">{slotMeta(ad.slot)?.label ?? ad.slot}</p>
                  <p className="text-[10px] text-neutral-600 font-mono mt-0.5">{ad.slot}</p>
                </td>
                <td className="px-6 py-4">
                  {ad.imageUrl && (
                    <img src={ad.imageUrl} alt="" className="h-8 w-14 object-cover rounded mb-1" />
                  )}
                  <p className="text-sm text-white">{ad.title || <span className="text-neutral-600 italic">sem título</span>}</p>
                  {ad.subtitle && <p className="text-xs text-neutral-500 truncate max-w-[200px]">{ad.subtitle}</p>}
                </td>
                <td className="px-6 py-4 text-xs text-neutral-500">
                  {ad.startsAt || ad.endsAt ? (
                    <div className="space-y-0.5">
                      <p className="flex items-center gap-1">
                        <span className="text-neutral-600">De:</span>
                        {ad.startsAt ? new Date(ad.startsAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </p>
                      <p className="flex items-center gap-1">
                        <span className="text-neutral-600">Até:</span>
                        {ad.endsAt ? new Date(ad.endsAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </p>
                    </div>
                  ) : (
                    <span className="text-neutral-700 italic">Sem limite</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => toggle(ad)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${ad.active ? "bg-green-500" : "bg-neutral-700"}`}>
                    <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${ad.active ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(ad)} className="p-1.5 text-neutral-400 hover:text-white transition-colors">
                      <Icon name="edit" className="text-base" />
                    </button>
                    <button onClick={() => remove(ad.id)} className="p-1.5 text-neutral-400 hover:text-red-400 transition-colors">
                      <Icon name="delete" className="text-base" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Editor modal */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#111414] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-base font-black text-white">{editing === "new" ? "Novo Anúncio" : "Editar Anúncio"}</h2>
              <button onClick={closeEditor} className="text-neutral-500 hover:text-white">
                <Icon name="close" className="text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Slot */}
              <div>
                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Slot / Posição</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary-container"
                  value={form.slot}
                  onChange={e => setForm((f: any) => ({ ...f, slot: e.target.value }))}
                >
                  {SLOTS.map(s => <option key={s.value} value={s.value} className="bg-neutral-900">{s.label}</option>)}
                </select>
                <p className="text-xs text-neutral-600 mt-1">{slotMeta(form.slot)?.desc}</p>
                {slotMeta(form.slot)?.dimensions && (
                  <div className="mt-2 flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2">
                    <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Medidas</span>
                    <span className="text-[11px] text-primary-container font-bold">{slotMeta(form.slot)?.dimensions}</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Título / Texto</label>
                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary-container"
                  placeholder="Texto do anúncio"
                  value={form.title ?? ""}
                  onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))} />
              </div>

              {/* Subtitle (not for topbar) */}
              {form.slot !== "home_topbar" && (
                <div>
                  <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Subtítulo</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary-container"
                    placeholder="Descrição curta"
                    value={form.subtitle ?? ""}
                    onChange={e => setForm((f: any) => ({ ...f, subtitle: e.target.value }))} />
                </div>
              )}

              {/* Image upload */}
              <ImageUpload
                value={form.imageUrl ?? ""}
                onChange={url => setForm((f: any) => ({ ...f, imageUrl: url }))}
                fixedHeight={form.slot === "home_topbar" ? 40 : undefined}
              />

              {/* Link */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">URL de destino</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary-container"
                    placeholder="https://..."
                    value={form.linkUrl ?? ""}
                    onChange={e => setForm((f: any) => ({ ...f, linkUrl: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Label do botão</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary-container"
                    placeholder="Saiba mais"
                    value={form.linkLabel ?? ""}
                    onChange={e => setForm((f: any) => ({ ...f, linkLabel: e.target.value }))} />
                </div>
              </div>

              {/* Colors (topbar only) */}
              {form.slot === "home_topbar" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Cor de fundo</label>
                    <div className="flex items-center gap-2">
                      <input type="color" className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" value={form.bgColor ?? "#e63946"} onChange={e => setForm((f: any) => ({ ...f, bgColor: e.target.value }))} />
                      <input className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none" value={form.bgColor ?? "#e63946"} onChange={e => setForm((f: any) => ({ ...f, bgColor: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Cor do texto</label>
                    <div className="flex items-center gap-2">
                      <input type="color" className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" value={form.textColor ?? "#ffffff"} onChange={e => setForm((f: any) => ({ ...f, textColor: e.target.value }))} />
                      <input className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none" value={form.textColor ?? "#ffffff"} onChange={e => setForm((f: any) => ({ ...f, textColor: e.target.value }))} />
                    </div>
                  </div>
                </div>
              )}

              {/* Popup delay (popup only) */}
              {form.slot === "home_popup" && (
                <div>
                  <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Delay de aparição (segundos)</label>
                  <input
                    type="number"
                    min={0}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary-container"
                    placeholder="0"
                    value={form.popupDelay ?? 0}
                    onChange={e => setForm((f: any) => ({ ...f, popupDelay: Number(e.target.value) }))}
                  />
                  <p className="text-xs text-neutral-600 mt-1">0 = aparece imediatamente. O pop-up só é exibido uma vez por sessão.</p>
                </div>
              )}

              {/* Schedule */}
              <div>
                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Período de exibição</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-neutral-500 mb-1">Início</p>
                    <input
                      type="datetime-local"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-primary-container [color-scheme:dark]"
                      value={form.startsAt ? form.startsAt.slice(0, 16) : ""}
                      onChange={e => setForm((f: any) => ({ ...f, startsAt: e.target.value ? new Date(e.target.value).toISOString() : "" }))}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-500 mb-1">Fim</p>
                    <input
                      type="datetime-local"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-primary-container [color-scheme:dark]"
                      value={form.endsAt ? form.endsAt.slice(0, 16) : ""}
                      onChange={e => setForm((f: any) => ({ ...f, endsAt: e.target.value ? new Date(e.target.value).toISOString() : "" }))}
                    />
                  </div>
                </div>
                <p className="text-xs text-neutral-600 mt-1.5">Deixe em branco para exibir sem limite de data.</p>
              </div>

              {/* Active */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-sm font-bold text-white">Ativo</p>
                  <p className="text-xs text-neutral-500">Exibir no site imediatamente</p>
                </div>
                <button onClick={() => setForm((f: any) => ({ ...f, active: !f.active }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.active ? "bg-green-500" : "bg-neutral-700"}`}>
                  <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${form.active ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-white/5 flex gap-3">
              <button onClick={save} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-container text-on-primary-container font-black text-sm rounded-xl hover:opacity-90 disabled:opacity-50">
                {saving ? <div className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" /> : <Icon name="save" className="text-base" />}
                Salvar
              </button>
              <button onClick={closeEditor} className="px-5 py-3 text-sm text-neutral-400 hover:text-white transition-colors font-bold">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
