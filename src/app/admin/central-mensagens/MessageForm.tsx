"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";

type Template = { id: string; name: string; type: string; title: string; body: string; ctaLabel?: string; ctaUrl?: string };

type FormData = {
  title: string; body: string; type: string; status: string;
  segment: string; channels: string[];
  ctaLabel: string; ctaUrl: string;
  tags: string; scheduledAt: string;
};

const TYPE_OPTIONS = [
  { value: "promotional", label: "Promocional", color: "text-orange-400" },
  { value: "notice",      label: "Aviso",       color: "text-blue-400"   },
  { value: "warning",     label: "Advertência", color: "text-red-400"    },
  { value: "system",      label: "Sistema",     color: "text-green-400"  },
];

const SEGMENT_OPTIONS = [
  { value: "all",     label: "Todos os usuários" },
  { value: "pf",      label: "Somente Pessoa Física" },
  { value: "lojista", label: "Somente Lojistas" },
];

const CHANNEL_OPTIONS = [
  { value: "in_app", label: "Notificação in-app", icon: "notifications" },
  { value: "email",  label: "E-mail",             icon: "mail"          },
];

function toLocalDatetime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function MessageForm({ messageId }: { messageId?: string }) {
  const router = useRouter();
  const isEdit = !!messageId;

  const [form, setForm] = useState<FormData>({
    title: "", body: "", type: "notice", status: "draft",
    segment: "all", channels: ["in_app"],
    ctaLabel: "", ctaUrl: "", tags: "", scheduledAt: "",
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [estimatedReach, setEstimatedReach] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetch("/api/admin/cms-message-templates").then(r => r.json()).then(setTemplates).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    fetch(`/api/admin/cms-messages/${messageId}`)
      .then(r => r.json())
      .then(d => {
        setForm({
          title: d.title ?? "",
          body: d.body ?? "",
          type: d.type ?? "notice",
          status: d.status ?? "draft",
          segment: d.segment ?? "all",
          channels: JSON.parse(d.channels ?? '["in_app"]'),
          ctaLabel: d.ctaLabel ?? "",
          ctaUrl: d.ctaUrl ?? "",
          tags: d.tags ? JSON.parse(d.tags).join(", ") : "",
          scheduledAt: toLocalDatetime(d.scheduledAt),
        });
        setLoading(false);
      });
  }, [messageId, isEdit]);

  // Estimar alcance
  useEffect(() => {
    const timeout = setTimeout(async () => {
      const p = new URLSearchParams();
      if (form.segment !== "all") p.set("segment", form.segment);
      const r = await fetch(`/api/admin/usuarios?${p}&limit=1`).catch(() => null);
      if (r?.ok) { const d = await r.json(); setEstimatedReach(d.total ?? null); }
    }, 500);
    return () => clearTimeout(timeout);
  }, [form.segment]);

  function set(field: keyof FormData, val: string) { setForm(f => ({ ...f, [field]: val })); }
  function toggleChannel(ch: string) {
    setForm(f => ({
      ...f,
      channels: f.channels.includes(ch) ? f.channels.filter(c => c !== ch) : [...f.channels, ch],
    }));
  }

  function applyTemplate(t: Template) {
    setForm(f => ({ ...f, title: t.title, body: t.body, type: t.type, ctaLabel: t.ctaLabel ?? "", ctaUrl: t.ctaUrl ?? "" }));
    setShowTemplates(false);
  }

  async function submit(status: string) {
    if (!form.title.trim()) { alert("Informe o título."); return; }
    setSaving(true);
    const payload = {
      ...form,
      status,
      channels: form.channels,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      scheduledAt: status === "scheduled" && form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
    };
    const url  = isEdit ? `/api/admin/cms-messages/${messageId}` : "/api/admin/cms-messages";
    const method = isEdit ? "PUT" : "POST";
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const d = await r.json();
    setSaving(false);

    // Salvar como template
    if (saveAsTemplate && templateName.trim()) {
      await fetch("/api/admin/cms-message-templates", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: templateName, type: form.type, title: form.title, body: form.body, ctaLabel: form.ctaLabel || null, ctaUrl: form.ctaUrl || null }),
      });
    }

    router.push("/admin/central-mensagens");
  }

  async function sendNow() {
    if (!form.title.trim() || !form.body.trim()) { alert("Preencha título e corpo antes de enviar."); return; }
    if (!confirm(`Enviar para ${form.segment === "all" ? "todos os usuários" : form.segment === "pf" ? "usuários PF" : "lojistas"}?`)) return;
    setSending(true);
    // Salvar primeiro se novo
    if (!isEdit) {
      const r = await fetch("/api/admin/cms-messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status: "draft", channels: form.channels, tags: [] }),
      });
      const d = await r.json();
      const id = d.id;
      const sr = await fetch(`/api/admin/cms-messages/${id}`, { method: "PATCH" });
      const sd = await sr.json();
      setSending(false);
      if (sd.ok) { alert(`✅ Enviado para ${sd.totalSent} usuários.`); router.push("/admin/central-mensagens"); }
      else alert(sd.error ?? "Erro ao enviar.");
    } else {
      // Salvar alterações e enviar
      await fetch(`/api/admin/cms-messages/${messageId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, channels: form.channels }),
      });
      const sr = await fetch(`/api/admin/cms-messages/${messageId}`, { method: "PATCH" });
      const sd = await sr.json();
      setSending(false);
      if (sd.ok) { alert(`✅ Enviado para ${sd.totalSent} usuários.`); router.push("/admin/central-mensagens"); }
      else alert(sd.error ?? "Erro ao enviar.");
    }
  }

  if (loading) return <div className="p-8 text-neutral-400">Carregando...</div>;

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button onClick={() => router.push("/admin/central-mensagens")} className="text-neutral-500 hover:text-white text-sm flex items-center gap-1 mb-2 transition-colors">
            <Icon name="arrow_back" className="text-sm" /> Voltar
          </button>
          <h1 className="text-2xl font-black text-white">{isEdit ? "Editar mensagem" : "Nova mensagem"}</h1>
        </div>
        <button onClick={() => setShowTemplates(v => !v)}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-neutral-300 font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
          <Icon name="bookmark" className="text-base" /> Usar template
        </button>
      </div>

      {/* Templates dropdown */}
      {showTemplates && (
        <div className="bg-[#111414] border border-white/10 rounded-2xl p-4 mb-6">
          <p className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-3">Selecione um template</p>
          {templates.length === 0
            ? <p className="text-neutral-500 text-sm">Nenhum template salvo.</p>
            : <div className="grid grid-cols-2 gap-2">
                {templates.map(t => (
                  <button key={t.id} onClick={() => applyTemplate(t)}
                    className="text-left bg-white/5 hover:bg-white/10 rounded-xl p-3 transition-colors">
                    <p className="text-white text-sm font-semibold">{t.name}</p>
                    <p className="text-neutral-500 text-xs truncate">{t.title}</p>
                  </button>
                ))}
              </div>
          }
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Coluna principal */}
        <div className="col-span-2 space-y-5">
          {/* Título */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block mb-1.5">Título *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)}
              placeholder="Ex: Oferta especial para lojistas"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500/50" />
          </div>

          {/* Corpo */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Corpo da mensagem *</label>
              <button onClick={() => setPreviewMode(v => !v)}
                className="text-[10px] text-neutral-500 hover:text-white flex items-center gap-1 transition-colors">
                <Icon name={previewMode ? "edit" : "visibility"} className="text-xs" />
                {previewMode ? "Editar" : "Preview"}
              </button>
            </div>
            {previewMode
              ? <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 min-h-[160px] prose prose-invert prose-sm max-w-none text-white text-sm"
                  dangerouslySetInnerHTML={{ __html: form.body }} />
              : <textarea value={form.body} onChange={e => set("body", e.target.value)} rows={8}
                  placeholder="Conteúdo da mensagem. Suporte a HTML: <b>negrito</b>, <a href='...'>link</a>, <br> para quebra de linha."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500/50 resize-none font-mono text-sm" />
            }
            <p className="text-[10px] text-neutral-600 mt-1">Suporte a HTML básico: &lt;b&gt;, &lt;i&gt;, &lt;a href&gt;, &lt;br&gt;</p>
          </div>

          {/* CTA */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block mb-1.5">Botão de ação (CTA)</label>
            <div className="grid grid-cols-2 gap-3">
              <input value={form.ctaLabel} onChange={e => set("ctaLabel", e.target.value)}
                placeholder="Ex: Ver oferta"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500/50 text-sm" />
              <input value={form.ctaUrl} onChange={e => set("ctaUrl", e.target.value)}
                placeholder="Ex: /busca ou https://..."
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500/50 text-sm" />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block mb-1.5">Tags (separadas por vírgula)</label>
            <input value={form.tags} onChange={e => set("tags", e.target.value)}
              placeholder="Ex: campanha-maio, black-friday, lojistas-sp"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500/50 text-sm" />
          </div>

          {/* Salvar como template */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={saveAsTemplate} onChange={e => setSaveAsTemplate(e.target.checked)} className="accent-yellow-500 w-4 h-4" />
              <span className="text-sm text-neutral-300 font-semibold">Salvar esta mensagem como template</span>
            </label>
            {saveAsTemplate && (
              <input value={templateName} onChange={e => setTemplateName(e.target.value)}
                placeholder="Nome do template"
                className="mt-3 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500/50 text-sm" />
            )}
          </div>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-5">
          {/* Tipo */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block mb-1.5">Tipo</label>
            <div className="space-y-2">
              {TYPE_OPTIONS.map(o => (
                <label key={o.value} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/8 transition-colors">
                  <input type="radio" name="type" value={o.value} checked={form.type === o.value} onChange={() => set("type", o.value)} className="accent-yellow-500" />
                  <span className={`text-sm font-semibold ${o.color}`}>{o.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Público */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block mb-1.5">Público-alvo</label>
            <div className="space-y-2">
              {SEGMENT_OPTIONS.map(o => (
                <label key={o.value} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/8 transition-colors">
                  <input type="radio" name="segment" value={o.value} checked={form.segment === o.value} onChange={() => set("segment", o.value)} className="accent-yellow-500" />
                  <span className="text-sm text-neutral-300">{o.label}</span>
                </label>
              ))}
            </div>
            {estimatedReach !== null && (
              <p className="text-[10px] text-neutral-500 mt-2 flex items-center gap-1">
                <Icon name="people" className="text-xs" /> ~{estimatedReach.toLocaleString("pt-BR")} destinatários estimados
              </p>
            )}
          </div>

          {/* Canais */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block mb-1.5">Canais</label>
            <div className="space-y-2">
              {CHANNEL_OPTIONS.map(o => (
                <label key={o.value} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/8 transition-colors">
                  <input type="checkbox" checked={form.channels.includes(o.value)} onChange={() => toggleChannel(o.value)} className="accent-yellow-500" />
                  <Icon name={o.icon} className="text-neutral-400 text-sm" />
                  <span className="text-sm text-neutral-300">{o.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Agendamento */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block mb-1.5">Agendar envio</label>
            <input type="datetime-local" value={form.scheduledAt} onChange={e => set("scheduledAt", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500/50 [color-scheme:dark]" />
            <p className="text-[10px] text-neutral-600 mt-1">Deixe em branco para enviar manualmente</p>
          </div>

          {/* Ações */}
          <div className="space-y-2 pt-2">
            <button onClick={sendNow} disabled={sending}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white font-black py-3 rounded-xl text-sm transition-colors">
              <Icon name="send" className="text-base" />
              {sending ? "Enviando..." : "Enviar agora"}
            </button>
            {form.scheduledAt && (
              <button onClick={() => submit("scheduled")} disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-black py-3 rounded-xl text-sm transition-colors">
                <Icon name="schedule" className="text-base" />
                {saving ? "Salvando..." : "Agendar envio"}
              </button>
            )}
            <button onClick={() => submit("draft")} disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 disabled:opacity-60 text-neutral-300 font-semibold py-3 rounded-xl text-sm transition-colors">
              <Icon name="save" className="text-base" />
              {saving ? "Salvando..." : "Salvar rascunho"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
