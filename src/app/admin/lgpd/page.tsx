"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";

type Tab = "privacidade" | "termos";

interface Form {
  lgpd_privacidade: string;
  lgpd_privacidade_updated: string;
  lgpd_termos: string;
  lgpd_termos_updated: string;
}

const EMPTY: Form = {
  lgpd_privacidade: "",
  lgpd_privacidade_updated: "",
  lgpd_termos: "",
  lgpd_termos_updated: "",
};

function today() {
  return new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

export default function AdminLGPD() {
  const [tab, setTab]       = useState<Tab>("privacidade");
  const [form, setForm]     = useState<Form>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    fetch("/api/admin/lgpd")
      .then(r => r.json())
      .then(d => {
        setForm({
          lgpd_privacidade:         d.lgpd_privacidade         ?? "",
          lgpd_privacidade_updated: d.lgpd_privacidade_updated ?? today(),
          lgpd_termos:              d.lgpd_termos              ?? "",
          lgpd_termos_updated:      d.lgpd_termos_updated      ?? today(),
        });
        setLoading(false);
      });
  }, []);

  async function save() {
    setSaving(true);
    await fetch("/api/admin/lgpd", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function set(key: keyof Form) {
    return (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));
  }

  const contentKey  = tab === "privacidade" ? "lgpd_privacidade"         : "lgpd_termos";
  const updatedKey  = tab === "privacidade" ? "lgpd_privacidade_updated" : "lgpd_termos_updated";
  const publicPath  = tab === "privacidade" ? "/privacidade"             : "/termos";
  const docLabel    = tab === "privacidade" ? "Política de Privacidade"  : "Termos de Uso";

  return (
    <div className="p-8 max-w-5xl">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white">LGPD</h1>
          <p className="text-neutral-500 text-sm mt-1">Edite os documentos legais exibidos no site</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={publicPath}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 text-sm transition-all"
          >
            <Icon name="open_in_new" className="text-base" />
            Ver no site
          </a>
          <button
            onClick={() => setPreview(p => !p)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all ${
              preview
                ? "border-primary-container text-primary-container"
                : "border-white/10 text-neutral-400 hover:text-white hover:border-white/20"
            }`}
          >
            <Icon name={preview ? "edit" : "visibility"} className="text-base" />
            {preview ? "Editar" : "Prévia"}
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 bg-primary-container text-on-primary-container font-black px-6 py-2 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />
            ) : (
              <Icon name={saved ? "check" : "save"} className="text-base" />
            )}
            {saved ? "Salvo!" : "Salvar"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#111414] border border-white/5 rounded-2xl p-1 w-fit">
        {(["privacidade", "termos"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setPreview(false); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
              tab === t
                ? "bg-primary-container text-on-primary-container"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            {t === "privacidade" ? "Política de Privacidade" : "Termos de Uso"}
          </button>
        ))}
      </div>

      <div className="space-y-4">

        {/* Data de atualização */}
        <div className="bg-[#111414] border border-white/5 rounded-2xl p-5">
          <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">
            Data da última atualização
          </label>
          <div className="flex items-center gap-3">
            <input
              value={form[updatedKey]}
              onChange={set(updatedKey)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary-container transition-colors w-72"
              placeholder="ex: 25 de abril de 2026"
            />
            <button
              onClick={() => setForm(f => ({ ...f, [updatedKey]: today() }))}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-neutral-400 hover:text-white text-xs transition-all"
            >
              Usar hoje
            </button>
          </div>
        </div>

        {/* Editor / Preview */}
        <div className="bg-[#111414] border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">
              {docLabel}
            </p>
            <p className="text-xs text-neutral-600">
              {preview ? "Prévia do conteúdo" : "Suporta HTML — use <h2>, <p>, <ul>, <strong>, <a href>"}
            </p>
          </div>

          {preview ? (
            <div
              className="p-8 prose prose-sm prose-invert max-w-none min-h-[520px] text-neutral-300 leading-relaxed
                [&_h2]:text-white [&_h2]:font-black [&_h2]:text-base [&_h2]:mt-6 [&_h2]:mb-2
                [&_p]:text-neutral-400 [&_p]:text-sm [&_p]:leading-relaxed
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
                [&_li]:text-neutral-400 [&_li]:text-sm
                [&_strong]:text-white [&_strong]:font-black
                [&_a]:text-primary-container [&_a]:underline
                [&_table]:w-full [&_th]:text-left [&_th]:text-xs [&_th]:font-black [&_th]:text-neutral-300 [&_th]:py-2 [&_th]:border-b [&_th]:border-white/10
                [&_td]:text-sm [&_td]:text-neutral-400 [&_td]:py-2 [&_td]:border-b [&_td]:border-white/5"
              dangerouslySetInnerHTML={{ __html: form[contentKey] || "<p class='text-neutral-600'>Nenhum conteúdo ainda.</p>" }}
            />
          ) : (
            <textarea
              value={form[contentKey]}
              onChange={set(contentKey)}
              rows={28}
              placeholder={`Cole aqui o HTML da ${docLabel}...`}
              className="w-full bg-transparent px-5 py-4 text-sm text-neutral-300 font-mono outline-none resize-none leading-relaxed placeholder:text-neutral-700"
            />
          )}
        </div>

        {/* Dica */}
        <div className="flex items-start gap-3 bg-primary-container/10 border border-primary-container/20 rounded-2xl p-4">
          <Icon name="info" className="text-primary-container text-lg flex-shrink-0 mt-0.5" />
          <p className="text-xs text-neutral-400 leading-relaxed">
            O conteúdo salvo aqui substitui o texto estático das páginas{" "}
            <strong className="text-white">/privacidade</strong> e{" "}
            <strong className="text-white">/termos</strong> do site. Se o campo estiver vazio, o texto padrão do código é exibido.
          </p>
        </div>

      </div>
    </div>
  );
}
