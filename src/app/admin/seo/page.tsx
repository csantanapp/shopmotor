"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";

export default function AdminSEO() {
  const [form, setForm] = useState({ seo_title: "", seo_description: "", seo_keywords: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/config").then(r => r.json()).then(d => {
      setForm({
        seo_title: d.seo_title ?? "",
        seo_description: d.seo_description ?? "",
        seo_keywords: d.seo_keywords ?? "",
      });
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">SEO Global</h1>
        <p className="text-neutral-500 text-sm mt-1">Meta tags padrão para páginas sem SEO específico</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-neutral-500 text-sm">
          <div className="w-5 h-5 border-2 border-neutral-600 border-t-transparent rounded-full animate-spin" />
          Carregando configurações...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-[#111414] border border-white/5 rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">
                Title padrão
              </label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary-container transition-colors"
                placeholder="ShopMotor — Compre e Venda Veículos"
                value={form.seo_title}
                onChange={e => setForm(f => ({ ...f, seo_title: e.target.value }))}
              />
              <p className="text-xs text-neutral-600 mt-1">{form.seo_title.length}/60 caracteres recomendados</p>
            </div>

            <div>
              <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">
                Description padrão
              </label>
              <textarea
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary-container transition-colors resize-none"
                placeholder="A plataforma para comprar e vender veículos com segurança."
                value={form.seo_description}
                onChange={e => setForm(f => ({ ...f, seo_description: e.target.value }))}
              />
              <p className="text-xs text-neutral-600 mt-1">{form.seo_description.length}/160 caracteres recomendados</p>
            </div>

            <div>
              <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">
                Keywords
              </label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary-container transition-colors"
                placeholder="comprar carro, vender carro, marketplace automotivo..."
                value={form.seo_keywords}
                onChange={e => setForm(f => ({ ...f, seo_keywords: e.target.value }))}
              />
              <p className="text-xs text-neutral-600 mt-1">Separadas por vírgula</p>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-[#111414] border border-white/5 rounded-2xl p-6">
            <p className="text-xs font-black text-neutral-500 uppercase tracking-widest mb-4">Preview Google</p>
            <div className="space-y-1">
              <p className="text-xs text-green-400">www.shopmotor.com.br</p>
              <p className="text-base text-blue-400 font-medium leading-tight">
                {form.seo_title || "ShopMotor — Compre e Venda Veículos"}
              </p>
              <p className="text-sm text-neutral-400 leading-relaxed">
                {form.seo_description || "A plataforma para comprar e vender veículos com segurança."}
              </p>
            </div>
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary-container font-black text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />
            ) : (
              <Icon name={saved ? "check" : "save"} className="text-base" />
            )}
            {saved ? "Salvo!" : "Salvar configurações"}
          </button>
        </div>
      )}
    </div>
  );
}
