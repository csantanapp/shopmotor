"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

type Template = {
  id: string; name: string; type: string; title: string; body: string;
  ctaLabel?: string; ctaUrl?: string; createdAt: string;
};

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  promotional: { label: "Promocional", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  notice:      { label: "Aviso",       color: "bg-blue-500/10 text-blue-400 border-blue-500/20"     },
  warning:     { label: "Advertência", color: "bg-red-500/10 text-red-400 border-red-500/20"        },
  system:      { label: "Sistema",     color: "bg-green-500/10 text-green-400 border-green-500/20"  },
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", type: "notice", title: "", body: "", ctaLabel: "", ctaUrl: "" });
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/cms-message-templates");
    const d = await r.json();
    setTemplates(d ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function create() {
    if (!form.name.trim() || !form.title.trim()) return;
    await fetch("/api/admin/cms-message-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", type: "notice", title: "", body: "", ctaLabel: "", ctaUrl: "" });
    setCreating(false);
    load();
  }

  async function del(id: string) {
    await fetch("/api/admin/cms-message-templates", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeleting(null);
    load();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/admin/central-mensagens" className="text-neutral-500 hover:text-white transition-colors">
              <Icon name="arrow_back" className="text-lg" />
            </Link>
            <h1 className="text-2xl font-black text-white">Templates de Mensagem</h1>
          </div>
          <p className="text-neutral-400 text-sm">{templates.length} templates salvos</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Icon name="add" className="text-base" /> Novo template
        </button>
      </div>

      {loading ? (
        <p className="text-neutral-500 text-center py-16">Carregando...</p>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <Icon name="bookmark" className="text-4xl mb-3 block" />
          <p>Nenhum template salvo ainda.</p>
          <p className="text-sm mt-1">Crie templates para agilizar o envio de mensagens frequentes.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map(t => (
            <div key={t.id} className="bg-[#111414] border border-white/5 rounded-2xl p-5 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-black truncate">{t.name}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${TYPE_CONFIG[t.type]?.color ?? "bg-white/5 text-white border-white/10"}`}>
                    {TYPE_CONFIG[t.type]?.label ?? t.type}
                  </span>
                </div>
                <p className="text-neutral-300 text-sm font-semibold truncate">{t.title}</p>
                <p className="text-neutral-500 text-xs mt-1 line-clamp-2">{t.body.replace(/<[^>]*>/g, "")}</p>
                {t.ctaLabel && (
                  <p className="text-xs text-yellow-500 mt-1">CTA: {t.ctaLabel}</p>
                )}
              </div>
              <button
                onClick={() => setDeleting(t.id)}
                className="p-2 rounded-lg hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition-colors flex-shrink-0"
                title="Excluir template"
              >
                <Icon name="delete" className="text-sm" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal: criar template */}
      {creating && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111414] border border-white/10 rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-white font-black text-lg mb-4">Novo template</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-400 font-semibold uppercase tracking-widest block mb-1">Nome do template</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Promoção de fim de semana"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50" />
              </div>
              <div>
                <label className="text-xs text-neutral-400 font-semibold uppercase tracking-widest block mb-1">Tipo</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50">
                  {["promotional","notice","warning","system"].map(v => (
                    <option key={v} value={v}>{TYPE_CONFIG[v]?.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-neutral-400 font-semibold uppercase tracking-widest block mb-1">Título</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Título da mensagem"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50" />
              </div>
              <div>
                <label className="text-xs text-neutral-400 font-semibold uppercase tracking-widest block mb-1">Corpo</label>
                <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  rows={4} placeholder="Conteúdo da mensagem..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 font-semibold uppercase tracking-widest block mb-1">Label CTA</label>
                  <input value={form.ctaLabel} onChange={e => setForm(f => ({ ...f, ctaLabel: e.target.value }))}
                    placeholder="Ex: Ver oferta"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 font-semibold uppercase tracking-widest block mb-1">URL CTA</label>
                  <input value={form.ctaUrl} onChange={e => setForm(f => ({ ...f, ctaUrl: e.target.value }))}
                    placeholder="/busca?..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setCreating(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-neutral-300 font-semibold py-2.5 rounded-xl text-sm transition-colors">
                Cancelar
              </button>
              <button onClick={create}
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-black py-2.5 rounded-xl text-sm transition-colors">
                Salvar template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: confirmar exclusão */}
      {deleting && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#111414] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-white font-black text-lg mb-2">Excluir template?</h3>
            <p className="text-neutral-400 text-sm mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleting(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-neutral-300 font-semibold py-2.5 rounded-xl text-sm transition-colors">
                Cancelar
              </button>
              <button onClick={() => del(deleting)}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-2.5 rounded-xl text-sm transition-colors">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
