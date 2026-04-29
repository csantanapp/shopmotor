"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

type Automation = {
  id: string; name: string; trigger: string; title: string; body: string;
  type: string; segment: string; channels: string; ctaLabel?: string; ctaUrl?: string;
  active: boolean; lastRunAt?: string;
};

const TRIGGERS: Record<string, { label: string; desc: string; icon: string }> = {
  plan_expiring_7d: { label: "Plano vencendo em 7 dias", desc: "Enviada para lojistas com plano expirando em 7 dias", icon: "schedule" },
  plan_expired:     { label: "Plano vencido",            desc: "Enviada no dia seguinte ao vencimento do plano",   icon: "event_busy" },
  new_user:         { label: "Novo usuário",             desc: "Enviada para usuários cadastrados nas últimas 24h", icon: "person_add" },
};

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  promotional: { label: "Promocional", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  notice:      { label: "Aviso",       color: "bg-blue-500/10 text-blue-400 border-blue-500/20"     },
  warning:     { label: "Advertência", color: "bg-red-500/10 text-red-400 border-red-500/20"        },
  system:      { label: "Sistema",     color: "bg-green-500/10 text-green-400 border-green-500/20"  },
};

const EMPTY_FORM = {
  name: "", trigger: "plan_expiring_7d", title: "", body: "",
  type: "notice", segment: "all", channels: ["in_app"],
  ctaLabel: "", ctaUrl: "", active: true,
};

export default function AutomacoesPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/cms-automations");
    setAutomations(await r.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() { setForm(EMPTY_FORM); setModal("create"); }
  function openEdit(a: Automation) {
    setForm({ ...a, channels: JSON.parse(a.channels ?? '["in_app"]') });
    setModal("edit");
  }

  async function save() {
    if (!form.name.trim() || !form.title.trim()) return;
    const method = modal === "edit" ? "PUT" : "POST";
    await fetch("/api/admin/cms-automations", {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setModal(null);
    load();
  }

  async function toggleActive(a: Automation) {
    await fetch("/api/admin/cms-automations", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: a.id, active: !a.active }),
    });
    load();
  }

  async function del(id: string) {
    await fetch("/api/admin/cms-automations", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeleting(null);
    load();
  }

  const fmt = (iso?: string) => iso ? new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "Nunca";

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/admin/central-mensagens" className="text-neutral-500 hover:text-white transition-colors">
              <Icon name="arrow_back" className="text-lg" />
            </Link>
            <h1 className="text-2xl font-black text-white">Automações</h1>
          </div>
          <p className="text-neutral-400 text-sm">Mensagens enviadas automaticamente por gatilhos</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black px-5 py-2.5 rounded-xl text-sm transition-colors">
          <Icon name="add" className="text-base" /> Nova automação
        </button>
      </div>

      {/* Triggers info */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {Object.entries(TRIGGERS).map(([key, t]) => (
          <div key={key} className="bg-[#111414] border border-white/5 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 bg-yellow-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon name={t.icon} className="text-yellow-400 text-base" />
            </div>
            <div>
              <p className="text-white text-sm font-black">{t.label}</p>
              <p className="text-neutral-500 text-xs mt-0.5">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="text-neutral-500 text-center py-16">Carregando...</p>
      ) : automations.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <Icon name="bolt" className="text-4xl mb-3 block" />
          <p>Nenhuma automação configurada.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {automations.map(a => {
            const trigger = TRIGGERS[a.trigger];
            const channels: string[] = JSON.parse(a.channels ?? '["in_app"]');
            return (
              <div key={a.id} className="bg-[#111414] border border-white/5 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name={trigger?.icon ?? "bolt"} className="text-neutral-400 text-base" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-white font-black">{a.name}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${TYPE_CONFIG[a.type]?.color}`}>
                      {TYPE_CONFIG[a.type]?.label}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${a.active ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-white/5 text-neutral-500 border-white/10"}`}>
                      {a.active ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                  <p className="text-neutral-400 text-xs mb-1">
                    <span className="text-yellow-500/70">{trigger?.label ?? a.trigger}</span>
                    {" · "}{channels.join(", ")}
                  </p>
                  <p className="text-neutral-300 text-sm font-semibold truncate">{a.title}</p>
                  <p className="text-neutral-500 text-xs mt-0.5">Última execução: {fmt(a.lastRunAt)}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleActive(a)}
                    className={`p-2 rounded-lg transition-colors ${a.active ? "hover:bg-red-500/10 text-neutral-400 hover:text-red-400" : "hover:bg-green-500/10 text-neutral-400 hover:text-green-400"}`}
                    title={a.active ? "Desativar" : "Ativar"}>
                    <Icon name={a.active ? "pause" : "play_arrow"} className="text-sm" />
                  </button>
                  <button onClick={() => openEdit(a)}
                    className="p-2 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-colors" title="Editar">
                    <Icon name="edit" className="text-sm" />
                  </button>
                  <button onClick={() => setDeleting(a.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition-colors" title="Excluir">
                    <Icon name="delete" className="text-sm" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal criar/editar */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111414] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-white font-black text-lg mb-4">{modal === "edit" ? "Editar automação" : "Nova automação"}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-400 font-semibold uppercase tracking-widest block mb-1">Nome</label>
                <input value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Aviso de vencimento"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50" />
              </div>
              <div>
                <label className="text-xs text-neutral-400 font-semibold uppercase tracking-widest block mb-1">Gatilho</label>
                <select value={form.trigger} onChange={e => setForm((f: any) => ({ ...f, trigger: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50">
                  {Object.entries(TRIGGERS).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-neutral-400 font-semibold uppercase tracking-widest block mb-1">Tipo</label>
                <select value={form.type} onChange={e => setForm((f: any) => ({ ...f, type: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50">
                  {["promotional","notice","warning","system"].map(v => <option key={v} value={v}>{TYPE_CONFIG[v]?.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-neutral-400 font-semibold uppercase tracking-widest block mb-1">Título</label>
                <input value={form.title} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))}
                  placeholder="Título da mensagem"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50" />
              </div>
              <div>
                <label className="text-xs text-neutral-400 font-semibold uppercase tracking-widest block mb-1">Corpo</label>
                <textarea value={form.body} onChange={e => setForm((f: any) => ({ ...f, body: e.target.value }))} rows={4}
                  placeholder="Conteúdo da mensagem..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 font-semibold uppercase tracking-widest block mb-1">Label CTA</label>
                  <input value={form.ctaLabel} onChange={e => setForm((f: any) => ({ ...f, ctaLabel: e.target.value }))}
                    placeholder="Ex: Renovar plano"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50" />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 font-semibold uppercase tracking-widest block mb-1">URL CTA</label>
                  <input value={form.ctaUrl} onChange={e => setForm((f: any) => ({ ...f, ctaUrl: e.target.value }))}
                    placeholder="/admin/assinaturas"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50" />
                </div>
              </div>
              <div>
                <label className="text-xs text-neutral-400 font-semibold uppercase tracking-widest block mb-2">Canais</label>
                <div className="flex gap-3">
                  {["in_app", "email"].map(ch => (
                    <label key={ch} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.channels.includes(ch)}
                        onChange={() => setForm((f: any) => ({
                          ...f,
                          channels: f.channels.includes(ch) ? f.channels.filter((c: string) => c !== ch) : [...f.channels, ch]
                        }))} className="accent-yellow-500" />
                      <span className="text-sm text-neutral-300">{ch === "in_app" ? "In-app" : "E-mail"}</span>
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer pt-1">
                <input type="checkbox" checked={form.active} onChange={e => setForm((f: any) => ({ ...f, active: e.target.checked }))} className="accent-yellow-500 w-4 h-4" />
                <span className="text-sm text-neutral-300 font-semibold">Automação ativa</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-neutral-300 font-semibold py-2.5 rounded-xl text-sm transition-colors">
                Cancelar
              </button>
              <button onClick={save}
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-black py-2.5 rounded-xl text-sm transition-colors">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal excluir */}
      {deleting && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#111414] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-white font-black text-lg mb-2">Excluir automação?</h3>
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
