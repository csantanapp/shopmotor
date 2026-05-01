"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

interface Subscription {
  id: string; plan: string; status: string;
  startsAt: string; endsAt: string; amount: number;
}

interface Store {
  id: string; name: string; email: string; phone: string | null; sharePhone: boolean;
  tradeName: string | null; companyName: string | null; cnpj: string | null;
  city: string | null; state: string | null; address: string | null; zipCode: string | null;
  plan: string; storeSlug: string | null; avatarUrl: string | null; storeBannerUrl: string | null;
  storeDescription: string | null; socialInstagram: string | null; socialFacebook: string | null;
  socialYoutube: string | null; socialTiktok: string | null;
  createdAt: string; lastSeenAt: string | null;
  _count: { vehicles: number };
  storeSubscriptions: Subscription[];
}

const SUBSCRIPTION_PLANS = ["STARTER", "PRO", "ELITE"];
const PLAN_COLORS: Record<string, string> = {
  STARTER: "bg-blue-500/10 text-blue-400",
  PRO:     "bg-yellow-500/10 text-yellow-400",
  ELITE:   "bg-purple-500/10 text-purple-400",
};

function planBadge(sub: Subscription | undefined) {
  if (!sub) return <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-white/5 text-neutral-500">Sem plano</span>;
  const cls = PLAN_COLORS[sub.plan] ?? "bg-white/5 text-neutral-400";
  return <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${cls}`}>{sub.plan}</span>;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600">{label}</p>
      <p className="text-sm text-neutral-300">{value || <span className="text-neutral-600">—</span>}</p>
    </div>
  );
}

export default function AdminLojas() {
  const [stores, setStores]   = useState<Store[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [selected, setSelected] = useState<Store | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);
  const [subPlan, setSubPlan] = useState("NONE");
  const [subMonths, setSubMonths] = useState("1");

  const [creating, setCreating] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState("");
  const emptyForm = { name:"", email:"", password:"", phone:"", cnpj:"", companyName:"", tradeName:"", city:"", state:"", address:"", zipCode:"", subscriptionPlan:"NONE", subscriptionMonths:"1" };
  const [newForm, setNewForm] = useState(emptyForm);

  function setF(field: string, value: string) { setNewForm(f => ({ ...f, [field]: value })); }

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), q: search });
    if (planFilter) params.set("plan", planFilter);
    const r = await fetch(`/api/admin/lojas?${params}`);
    const d = await r.json();
    setStores(d.stores ?? []);
    setTotal(d.total ?? 0);
    setPages(d.pages ?? 1);
    setLoading(false);
  }, [page, search, planFilter]);

  useEffect(() => { setPage(1); }, [search, planFilter]);
  useEffect(() => { load(); }, [load]);

  function openEdit(s: Store) {
    setSelected(s);
    const activeSub = s.storeSubscriptions?.[0];
    setSubPlan(activeSub?.plan ?? "NONE");
    setSubMonths("1");
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    await fetch("/api/admin/lojas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, subscriptionPlan: subPlan, subscriptionMonths: subMonths }),
    });
    setSaving(false);
    setSelected(null);
    load();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    setCreateSaving(true);
    const res = await fetch("/api/admin/lojas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newForm),
    });
    const data = await res.json();
    setCreateSaving(false);
    if (!res.ok) { setCreateError(data.error ?? "Erro ao criar loja."); return; }
    setCreating(false);
    setNewForm(emptyForm);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta loja e todos seus dados? Esta ação é irreversível.")) return;
    setDeleting(id);
    await fetch("/api/admin/lojas", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeleting(null);
    load();
  }

  const displayName = (s: Store) => s.tradeName || s.companyName || s.name;
  const fmtCnpj = (v: string | null) => v ? v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5") : null;
  const fmtDate = (v: string) => new Date(v).toLocaleDateString("pt-BR");
  const lastSeen = (d: string | null) => {
    if (!d) return "Nunca";
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}min atrás`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h atrás`;
    return `${Math.floor(hrs / 24)}d atrás`;
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Lojas (PJ)</h1>
          <p className="text-neutral-500 text-sm mt-1">{total} lojas cadastradas</p>
        </div>
        <button
          onClick={() => { setCreating(true); setCreateError(""); setNewForm(emptyForm); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-container text-on-primary-container rounded-xl text-sm font-black uppercase tracking-widest hover:-translate-y-0.5 transition-all flex-shrink-0"
        >
          <Icon name="add" className="text-base" />
          Nova loja
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-[#111414] border border-white/5 rounded-xl px-4 py-2.5 flex-1 min-w-[200px]">
          <Icon name="search" className="text-neutral-500 text-lg flex-shrink-0" />
          <input
            className="bg-transparent outline-none text-sm text-white placeholder:text-neutral-600 w-full"
            placeholder="Nome, slug, e-mail ou CNPJ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-neutral-600 hover:text-white">
              <Icon name="close" className="text-base" />
            </button>
          )}
        </div>
        <select
          value={planFilter} onChange={e => setPlanFilter(e.target.value)}
          className="bg-[#111414] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
        >
          <option value="">Todos os planos</option>
          {SUBSCRIPTION_PLANS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-[#111414] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest">Loja</th>
                <th className="text-left px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest hidden md:table-cell">Contato</th>
                <th className="text-left px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest hidden lg:table-cell">CNPJ</th>
                <th className="text-left px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest hidden lg:table-cell">Cidade</th>
                <th className="text-left px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest">Plano</th>
                <th className="text-left px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest hidden sm:table-cell">Anúncios</th>
                <th className="text-left px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest hidden xl:table-cell">Último acesso</th>
                <th className="text-left px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest hidden sm:table-cell">Cadastro</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={9} className="text-center py-16 text-neutral-600">
                  <span className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin inline-block" />
                </td></tr>
              ) : stores.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-16 text-neutral-600">Nenhuma loja encontrada.</td></tr>
              ) : stores.map(s => {
                const activeSub = s.storeSubscriptions?.[0];
                return (
                  <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {s.avatarUrl
                          ? <img src={s.avatarUrl} className="w-8 h-8 rounded-full object-cover flex-shrink-0" alt="" />
                          : <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-xs font-black text-neutral-400">{displayName(s).charAt(0)}</div>
                        }
                        <div>
                          <p className="text-sm text-white font-semibold">{displayName(s)}</p>
                          {s.storeSlug && <p className="text-xs text-neutral-600 mt-0.5">/{s.storeSlug}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-sm text-neutral-400">{s.email}</p>
                      {s.phone && <p className="text-xs text-neutral-600">{s.phone}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500 hidden lg:table-cell">{fmtCnpj(s.cnpj) ?? "—"}</td>
                    <td className="px-6 py-4 text-sm text-neutral-400 hidden lg:table-cell">
                      {s.city ? `${s.city}${s.state ? `, ${s.state}` : ""}` : "—"}
                    </td>
                    <td className="px-6 py-4">{planBadge(activeSub)}</td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-sm font-black text-white">{s._count.vehicles}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-neutral-500 hidden xl:table-cell">{lastSeen(s.lastSeenAt)}</td>
                    <td className="px-6 py-4 text-sm text-neutral-500 hidden sm:table-cell">{fmtDate(s.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        {s.storeSlug && (
                          <Link href={`/loja/${s.storeSlug}`} target="_blank"
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors" title="Ver loja">
                            <Icon name="open_in_new" className="text-sm text-neutral-400" />
                          </Link>
                        )}
                        <button onClick={() => openEdit(s)}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors" title="Gerenciar">
                          <Icon name="manage_accounts" className="text-sm text-neutral-400" />
                        </button>
                        <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id}
                          className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors disabled:opacity-50" title="Excluir">
                          <Icon name="delete" className="text-sm text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
            <p className="text-xs text-neutral-500">Página {page} de {pages} · {total} lojas</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-sm text-neutral-400 hover:bg-white/10 disabled:opacity-30 transition-colors">
                <Icon name="chevron_left" className="text-base" />
              </button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                const pg = page <= 3 ? i + 1 : page - 2 + i;
                if (pg < 1 || pg > pages) return null;
                return (
                  <button key={pg} onClick={() => setPage(pg)}
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${pg === page ? "bg-primary-container text-on-primary-container" : "bg-white/5 text-neutral-400 hover:bg-white/10"}`}>
                    {pg}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-sm text-neutral-400 hover:bg-white/10 disabled:opacity-30 transition-colors">
                <Icon name="chevron_right" className="text-base" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal criar loja */}
      {creating && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-[#111414] border border-white/10 rounded-2xl w-full max-w-xl my-8 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <h2 className="font-black text-white flex items-center gap-2"><Icon name="store" className="text-lg" />Nova Loja</h2>
              <button onClick={() => setCreating(false)} className="text-neutral-500 hover:text-white transition-colors">
                <Icon name="close" className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              {createError && (
                <div className="flex items-center gap-2 bg-red-500/10 text-red-400 rounded-xl px-4 py-3 text-sm">
                  <Icon name="error" className="text-base flex-shrink-0" />{createError}
                </div>
              )}
              <p className="text-xs font-black uppercase tracking-widest text-neutral-500">Dados da empresa</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-neutral-500 block mb-1.5">Razão Social *</label>
                  <input required value={newForm.companyName} onChange={e => setF("companyName", e.target.value)}
                    placeholder="Nome jurídico" className="w-full bg-[#1a1e1e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600" />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 block mb-1.5">Nome Fantasia</label>
                  <input value={newForm.tradeName} onChange={e => setF("tradeName", e.target.value)}
                    placeholder="Como é conhecida" className="w-full bg-[#1a1e1e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600" />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 block mb-1.5">CNPJ</label>
                  <input value={newForm.cnpj} onChange={e => setF("cnpj", e.target.value)}
                    placeholder="00.000.000/0001-00" className="w-full bg-[#1a1e1e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600" />
                </div>
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-neutral-500 pt-1">Responsável &amp; Acesso</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-neutral-500 block mb-1.5">Nome do responsável *</label>
                  <input required value={newForm.name} onChange={e => setF("name", e.target.value)}
                    placeholder="Nome completo" className="w-full bg-[#1a1e1e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600" />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 block mb-1.5">E-mail *</label>
                  <input required type="email" value={newForm.email} onChange={e => setF("email", e.target.value)}
                    placeholder="loja@email.com" className="w-full bg-[#1a1e1e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600" />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 block mb-1.5">Senha *</label>
                  <input required type="password" value={newForm.password} onChange={e => setF("password", e.target.value)}
                    placeholder="Mín. 8 caracteres" className="w-full bg-[#1a1e1e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-neutral-500 block mb-1.5">Telefone</label>
                  <input value={newForm.phone} onChange={e => setF("phone", e.target.value)}
                    placeholder="(11) 99999-9999" className="w-full bg-[#1a1e1e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600" />
                </div>
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-neutral-500 pt-1">Endereço</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-neutral-500 block mb-1.5">Cidade</label>
                  <input value={newForm.city} onChange={e => setF("city", e.target.value)}
                    placeholder="Cidade" className="w-full bg-[#1a1e1e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600" />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 block mb-1.5">Estado</label>
                  <input value={newForm.state} onChange={e => setF("state", e.target.value)}
                    placeholder="SP" maxLength={2} className="w-full bg-[#1a1e1e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-neutral-500 block mb-1.5">Endereço</label>
                  <input value={newForm.address} onChange={e => setF("address", e.target.value)}
                    placeholder="Rua, número, complemento" className="w-full bg-[#1a1e1e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600" />
                </div>
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-neutral-500 pt-1">Assinatura inicial (opcional)</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-neutral-500 block mb-1.5">Plano</label>
                  <select value={newForm.subscriptionPlan} onChange={e => setF("subscriptionPlan", e.target.value)}
                    className="w-full bg-[#1a1e1e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none">
                    <option value="NONE">— Sem plano —</option>
                    {SUBSCRIPTION_PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                {newForm.subscriptionPlan !== "NONE" && (
                  <div>
                    <label className="text-xs text-neutral-500 block mb-1.5">Duração (meses)</label>
                    <select value={newForm.subscriptionMonths} onChange={e => setF("subscriptionMonths", e.target.value)}
                      className="w-full bg-[#1a1e1e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none">
                      {[1, 3, 6, 12].map(m => <option key={m} value={m}>{m} {m === 1 ? "mês" : "meses"}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setCreating(false)}
                  className="flex-1 py-3 rounded-full border border-white/10 text-sm text-neutral-400 hover:bg-white/5 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={createSaving}
                  className="flex-1 py-3 rounded-full bg-primary-container text-on-primary-container text-sm font-black uppercase tracking-widest hover:-translate-y-0.5 transition-all disabled:opacity-60">
                  {createSaving ? "Criando..." : "Criar loja"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal detalhes + gerenciamento */}
      {selected && (() => {
        const activeSub = selected.storeSubscriptions?.[0];
        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="bg-[#111414] border border-white/10 rounded-2xl w-full max-w-2xl my-8 overflow-hidden">

              {/* Header modal */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  {selected.avatarUrl
                    ? <img src={selected.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
                    : <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-black text-neutral-400">{displayName(selected).charAt(0)}</div>
                  }
                  <div>
                    <h2 className="font-black text-white">{displayName(selected)}</h2>
                    {selected.storeSlug && <p className="text-xs text-neutral-500">/{selected.storeSlug}</p>}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-neutral-500 hover:text-white transition-colors">
                  <Icon name="close" className="text-xl" />
                </button>
              </div>

              <div className="p-6 space-y-6">

                {/* Dados cadastrais */}
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-3">Dados Cadastrais</p>
                  <div className="bg-white/[0.03] rounded-xl p-4 grid grid-cols-2 gap-4">
                    <Row label="Nome/Razão Social" value={selected.companyName} />
                    <Row label="Nome Fantasia" value={selected.tradeName} />
                    <Row label="CNPJ" value={fmtCnpj(selected.cnpj)} />
                    <Row label="E-mail" value={selected.email} />
                    <Row label="Telefone" value={selected.phone} />
                    <Row label="Telefone público" value={selected.sharePhone ? "Sim" : "Não"} />
                    <Row label="Instagram" value={selected.socialInstagram} />
                    <Row label="Facebook" value={selected.socialFacebook} />
                    <Row label="YouTube" value={selected.socialYoutube} />
                    <Row label="TikTok" value={selected.socialTiktok} />
                  </div>
                </div>

                {/* Endereço */}
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-3">Endereço</p>
                  <div className="bg-white/[0.03] rounded-xl p-4 grid grid-cols-2 gap-4">
                    <Row label="Endereço" value={selected.address} />
                    <Row label="CEP" value={selected.zipCode} />
                    <Row label="Cidade" value={selected.city} />
                    <Row label="Estado" value={selected.state} />
                  </div>
                </div>

                {/* Bio */}
                {selected.storeDescription && (
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-3">Descrição da Loja</p>
                    <div className="bg-white/[0.03] rounded-xl p-4">
                      <p className="text-sm text-neutral-300 whitespace-pre-wrap">{selected.storeDescription}</p>
                    </div>
                  </div>
                )}

                {/* Métricas */}
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-3">Atividade</p>
                  <div className="bg-white/[0.03] rounded-xl p-4 grid grid-cols-3 gap-4">
                    <Row label="Anúncios" value={selected._count.vehicles} />
                    <Row label="Cadastro" value={fmtDate(selected.createdAt)} />
                    <Row label="Último acesso" value={lastSeen(selected.lastSeenAt)} />
                  </div>
                </div>

                {/* Assinatura atual */}
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-3">Assinatura Atual</p>
                  <div className="bg-white/[0.03] rounded-xl p-4">
                    {activeSub ? (
                      <div className="grid grid-cols-2 gap-4">
                        <Row label="Plano" value={<span className={`text-xs font-black uppercase px-2 py-1 rounded-full ${PLAN_COLORS[activeSub.plan] ?? ""}`}>{activeSub.plan}</span>} />
                        <Row label="Status" value={activeSub.status} />
                        <Row label="Início" value={fmtDate(activeSub.startsAt)} />
                        <Row label="Vencimento" value={fmtDate(activeSub.endsAt)} />
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-500">Nenhuma assinatura ativa.</p>
                    )}
                  </div>
                </div>

                {/* Atualizar plano */}
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-3">Atualizar Plano</p>
                  <div className="bg-white/[0.03] rounded-xl p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-neutral-500 block mb-1.5">Novo plano</label>
                        <select value={subPlan} onChange={e => setSubPlan(e.target.value)}
                          className="w-full bg-[#1a1e1e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none">
                          <option value="NONE">— Sem plano (cancelar) —</option>
                          {SUBSCRIPTION_PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      {subPlan !== "NONE" && (
                        <div>
                          <label className="text-xs text-neutral-500 block mb-1.5">Duração (meses)</label>
                          <select value={subMonths} onChange={e => setSubMonths(e.target.value)}
                            className="w-full bg-[#1a1e1e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none">
                            {[1, 3, 6, 12].map(m => <option key={m} value={m}>{m} {m === 1 ? "mês" : "meses"}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                    {subPlan !== "NONE" && (
                      <p className="text-xs text-neutral-600">
                        A assinatura ativa atual será cancelada e substituída pelo plano selecionado.
                      </p>
                    )}
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="flex gap-3 px-6 py-5 border-t border-white/5">
                <button onClick={() => setSelected(null)}
                  className="flex-1 py-3 rounded-full border border-white/10 text-sm text-neutral-400 hover:bg-white/5 transition-colors">
                  Fechar
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-3 rounded-full bg-primary-container text-on-primary-container text-sm font-black uppercase tracking-widest hover:-translate-y-0.5 transition-all disabled:opacity-60">
                  {saving ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
