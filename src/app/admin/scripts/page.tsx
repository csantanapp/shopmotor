"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";

const PLACEHOLDER = `<!-- Cole aqui seus scripts de rastreamento -->
<!-- Exemplos: Meta Pixel, Google Tag Manager, TikTok Pixel, Hotjar -->

<!-- Meta Pixel -->
<script>
  !function(f,b,e,v,n,t,s){...}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'SEU_PIXEL_ID');
  fbq('track', 'PageView');
</script>

<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>`;

export default function AdminScripts() {
  const [scripts, setScripts] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/config").then(r => r.json()).then(d => {
      setScripts(d.pixel_scripts ?? "");
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pixel_scripts: scripts }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const providers = [
    { name: "Meta Pixel",          icon: "thumb_up", color: "text-blue-400",   desc: "Facebook & Instagram Ads" },
    { name: "Google Tag Manager",  icon: "tag",      color: "text-red-400",    desc: "GTM container" },
    { name: "TikTok Pixel",        icon: "music_note", color: "text-pink-400", desc: "TikTok Ads" },
    { name: "Google Analytics 4",  icon: "analytics", color: "text-yellow-400", desc: "GA4 measurement" },
    { name: "Hotjar",              icon: "whatshot", color: "text-orange-400", desc: "Heatmaps & session replay" },
    { name: "Clarity",             icon: "visibility", color: "text-cyan-400", desc: "Microsoft Clarity" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Pixel & Scripts</h1>
        <p className="text-neutral-500 text-sm mt-1">Scripts injetados no {"<head>"} de todas as páginas</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {providers.map(p => (
          <div key={p.name} className="bg-[#111414] border border-white/5 rounded-xl p-4 flex items-center gap-3">
            <Icon name={p.icon} className={`text-xl ${p.color}`} />
            <div>
              <p className="text-sm font-bold text-white">{p.name}</p>
              <p className="text-xs text-neutral-500">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#111414] border border-white/5 rounded-2xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-white">Scripts Personalizados</p>
            <p className="text-xs text-neutral-500 mt-0.5">Cole o código HTML/JS completo com as tags {"<script>"}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${scripts.trim() ? "bg-green-400" : "bg-neutral-600"}`} />
            <span className="text-xs text-neutral-500">{scripts.trim() ? "Scripts ativos" : "Nenhum script"}</span>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center gap-3 p-6 text-neutral-500 text-sm">
            <div className="w-5 h-5 border-2 border-neutral-600 border-t-transparent rounded-full animate-spin" />
            Carregando...
          </div>
        ) : (
          <textarea
            rows={18}
            className="w-full bg-transparent px-6 py-5 text-sm text-neutral-300 font-mono outline-none resize-none"
            placeholder={PLACEHOLDER}
            value={scripts}
            onChange={e => setScripts(e.target.value)}
            spellCheck={false}
          />
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving || loading}
          className="flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary-container font-black text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />
          ) : (
            <Icon name={saved ? "check" : "save"} className="text-base" />
          )}
          {saved ? "Scripts salvos!" : "Salvar scripts"}
        </button>

        <p className="text-xs text-neutral-600">
          Os scripts serão aplicados em todos os usuários na próxima visita.
        </p>
      </div>
    </div>
  );
}
