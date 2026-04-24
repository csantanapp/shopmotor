"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

interface Store {
  id: string; name: string; email: string; phone: string | null;
  tradeName: string | null; companyName: string | null; cnpj: string | null;
  city: string | null; state: string | null; plan: string; storeSlug: string | null;
  createdAt: string; lastSeenAt: string | null;
  _count: { vehicles: number };
}

const PLANS = ["", "FREE", "PREMIUM"];

export default function AdminLojas() {
  const [stores, setStores]   = useState<Store[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [plan, setPlan]       = useState("");
  const [selected, setSelected] = useState<Store | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);
  const [editForm, setEditForm] = useState<{ plan: string }>({ plan: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), q: search });
    if (plan) params.set("plan", plan);
    const r = await fetch(`/api/admin/lojas?${params}`);
    const d = await r.json();
    setStores(d.stores ?? []);
    setTotal(d.total ?? 0);
    setPages(d.pages ?? 1);
    setLoading(false);
  }, [page, search, plan]);

  useEffect(() => { setPage(1); }, [search, plan]);
  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    await fetch("/api/admin/lojas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, plan: editForm.plan }),
    });
    setSaving(false);
    setSelected(null);
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

  function openEdit(s: Store) {
    setSelected(s);
    setEditForm({ plan: s.plan });
  }

  const displayName = (s: Store) => s.tradeName || s.companyName || s.name;

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Lojas (PJ)</h1>
          <p className="text-neutral-500 text-sm mt-1">{total} lojas cadastradas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-[#111414] border border-white/5 rounded-xl px-4 py-2.5 flex-1 min-w-[200px]">
          <Icon name="search" className="text-neutral-500 text-lg flex-shrink-0" />
          <input
            className="bg-transparent outline-none text-sm text-white placeholder:text-neutral-600 w-full"
            placeholder="Buscar por nome, slug ou e-mail..."
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
          value={plan} onChange={e => setPlan(e.target.value)}
          className="bg-[#111414] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
        >
          {PLANS.map(p => <option key={p} value={p}>{p || "Todos os planos"}</option>)}
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
              ) : stores.map(s => (
                <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm text-white font-semibold">{displayName(s)}</p>
                    {s.storeSlug && (
                      <p className="text-xs text-neutral-600 mt-0.5">/{s.storeSlug}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="text-sm text-neutral-400">{s.email}</p>
                    {s.phone && <p className="text-xs text-neutral-600">{s.phone}</p>}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500 hidden lg:table-cell">
                    {s.cnpj ? s.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5") : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-400 hidden lg:table-cell">
                    {s.city ? `${s.city}, ${s.state}` : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                      s.plan === "PREMIUM" ? "bg-yellow-500/10 text-yellow-400" : "bg-white/5 text-neutral-500"
                    }`}>{s.plan}</span>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="text-sm font-black text-white">{s._count.vehicles}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-neutral-500 hidden xl:table-cell">
                    {lastSeen(s.lastSeenAt)}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500 hidden sm:table-cell">
                    {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      {s.storeSlug && (
                        <Link
                          href={`/loja/${s.storeSlug}`}
                          target="_blank"
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                          title="Ver loja"
                        >
                          <Icon name="open_in_new" className="text-sm text-neutral-400" />
                        </Link>
                      )}
                      <button
                        onClick={() => openEdit(s)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                        title="Editar"
                      >
                        <Icon name="edit" className="text-sm text-neutral-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        disabled={deleting === s.id}
                        className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors disabled:opacity-50"
                        title="Excluir"
                      >
                        <Icon name="delete" className="text-sm text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
            <p className="text-xs text-neutral-500">
              Página {page} de {pages} · {total} lojas
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-sm text-neutral-400 hover:bg-white/10 disabled:opacity-30 transition-colors"
              >
                <Icon name="chevron_left" className="text-base" />
              </button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                const pg = page <= 3 ? i + 1 : page - 2 + i;
                if (pg < 1 || pg > pages) return null;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                      pg === page ? "bg-primary-container text-on-primary-container" : "bg-white/5 text-neutral-400 hover:bg-white/10"
                    }`}
                  >{pg}</button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-sm text-neutral-400 hover:bg-white/10 disabled:opacity-30 transition-colors"
              >
                <Icon name="chevron_right" className="text-base" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal edição */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111414] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-white">Editar loja</h2>
              <button onClick={() => setSelected(null)} className="text-neutral-500 hover:text-white">
                <Icon name="close" className="text-xl" />
              </button>
            </div>
            <div className="bg-white/5 rounded-xl p-4 space-y-1">
              <p className="font-semibold text-white">{displayName(selected)}</p>
              <p className="text-xs text-neutral-500">{selected.email}</p>
              {selected.storeSlug && <p className="text-xs text-neutral-600">/{selected.storeSlug}</p>}
              {selected.cnpj && (
                <p className="text-xs text-neutral-600">
                  {selected.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-neutral-500 block mb-2">Plano</label>
              <select
                value={editForm.plan}
                onChange={e => setEditForm({ plan: e.target.value })}
                className="w-full bg-[#1a1e1e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
              >
                <option value="FREE">FREE</option>
                <option value="PREMIUM">PREMIUM</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 py-3 rounded-full border border-white/10 text-sm text-neutral-400 hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-full bg-primary-container text-on-primary-container text-sm font-black uppercase tracking-widest hover:-translate-y-0.5 transition-all disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
