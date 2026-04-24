"use client";

import { useEffect, useState, useCallback } from "react";
import Icon from "@/components/ui/Icon";

interface User {
  id: string; name: string; email: string; phone: string | null;
  city: string | null; state: string | null; plan: string; role: string;
  createdAt: string; lastSeenAt: string | null; nickname: string | null;
  _count: { vehicles: number };
}

const PLANS = ["", "FREE", "PREMIUM"];
const ROLES = ["", "USER", "ADMIN"];

export default function AdminUsuarios() {
  const [users, setUsers]     = useState<User[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [plan, setPlan]       = useState("");
  const [role, setRole]       = useState("");
  const [selected, setSelected] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving]   = useState(false);
  const [editForm, setEditForm] = useState<{ plan: string; role: string }>({ plan: "", role: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), q: search });
    if (plan) params.set("plan", plan);
    if (role) params.set("role", role);
    const r = await fetch(`/api/admin/usuarios?${params}`);
    const d = await r.json();
    setUsers(d.users ?? []);
    setTotal(d.total ?? 0);
    setPages(d.pages ?? 1);
    setLoading(false);
  }, [page, search, plan, role]);

  useEffect(() => { setPage(1); }, [search, plan, role]);
  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    await fetch("/api/admin/usuarios", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, plan: editForm.plan, role: editForm.role }),
    });
    setSaving(false);
    setSelected(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este usuário e todos seus dados? Esta ação é irreversível.")) return;
    setDeleting(id);
    await fetch("/api/admin/usuarios", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeleting(null);
    load();
  }

  function openEdit(u: User) {
    setSelected(u);
    setEditForm({ plan: u.plan, role: u.role });
  }

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
          <h1 className="text-2xl font-black text-white">Usuários PF</h1>
          <p className="text-neutral-500 text-sm mt-1">{total} usuários cadastrados</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-[#111414] border border-white/5 rounded-xl px-4 py-2.5 flex-1 min-w-[200px]">
          <Icon name="search" className="text-neutral-500 text-lg flex-shrink-0" />
          <input
            className="bg-transparent outline-none text-sm text-white placeholder:text-neutral-600 w-full"
            placeholder="Buscar por nome ou e-mail..."
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
        <select
          value={role} onChange={e => setRole(e.target.value)}
          className="bg-[#111414] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
        >
          {ROLES.map(r => <option key={r} value={r}>{r || "Todos os perfis"}</option>)}
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-[#111414] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest">Usuário</th>
                <th className="text-left px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest hidden md:table-cell">Contato</th>
                <th className="text-left px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest hidden lg:table-cell">Localização</th>
                <th className="text-left px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest">Plano</th>
                <th className="text-left px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest hidden lg:table-cell">Anúncios</th>
                <th className="text-left px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest hidden xl:table-cell">Último acesso</th>
                <th className="text-left px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest hidden sm:table-cell">Cadastro</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-16 text-neutral-600">
                  <span className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin inline-block" />
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-neutral-600">Nenhum usuário encontrado.</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm text-white font-semibold">{u.name}</p>
                    {u.nickname && <p className="text-xs text-neutral-500">"{u.nickname}"</p>}
                    {u.role === "ADMIN" && (
                      <span className="text-[10px] font-black text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">ADMIN</span>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="text-sm text-neutral-400">{u.email}</p>
                    {u.phone && <p className="text-xs text-neutral-600">{u.phone}</p>}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-400 hidden lg:table-cell">
                    {u.city ? `${u.city}, ${u.state}` : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                      u.plan === "PREMIUM" ? "bg-yellow-500/10 text-yellow-400" : "bg-white/5 text-neutral-500"
                    }`}>{u.plan}</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-sm font-black text-white">{u._count.vehicles}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-neutral-500 hidden xl:table-cell">
                    {lastSeen(u.lastSeenAt)}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500 hidden sm:table-cell">
                    {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(u)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                        title="Editar"
                      >
                        <Icon name="edit" className="text-sm text-neutral-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        disabled={deleting === u.id}
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
              Página {page} de {pages} · {total} usuários
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
              <h2 className="font-black text-white">Editar usuário</h2>
              <button onClick={() => setSelected(null)} className="text-neutral-500 hover:text-white">
                <Icon name="close" className="text-xl" />
              </button>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="font-semibold text-white">{selected.name}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{selected.email}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-neutral-500 block mb-2">Plano</label>
                <select
                  value={editForm.plan}
                  onChange={e => setEditForm(f => ({ ...f, plan: e.target.value }))}
                  className="w-full bg-[#1a1e1e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="FREE">FREE</option>
                  <option value="PREMIUM">PREMIUM</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-neutral-500 block mb-2">Perfil de acesso</label>
                <select
                  value={editForm.role}
                  onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full bg-[#1a1e1e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
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
