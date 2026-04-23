"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";

export default function AdminUsuarios() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats").then(r => r.json()).then(d => {
      setUsers(d.recentUsers ?? []);
      setLoading(false);
    });
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Usuários PF</h1>
          <p className="text-neutral-500 text-sm mt-1">{users.length} cadastros recentes</p>
        </div>
        <div className="flex items-center gap-3 bg-[#111414] border border-white/5 rounded-xl px-4 py-2.5">
          <Icon name="search" className="text-neutral-500 text-lg" />
          <input
            className="bg-transparent outline-none text-sm text-white placeholder:text-neutral-600 w-48"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-[#111414] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest">Nome</th>
              <th className="text-left px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest">E-mail</th>
              <th className="text-left px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest">Cidade</th>
              <th className="text-left px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest">Plano</th>
              <th className="text-left px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest">Cadastro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-neutral-600">Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-neutral-600">Nenhum resultado.</td></tr>
            ) : filtered.map((u: any) => (
              <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm text-white font-semibold">{u.name}</p>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-400">{u.email}</td>
                <td className="px-6 py-4 text-sm text-neutral-400">{u.city ? `${u.city}/${u.state}` : "—"}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                    u.plan === "PREMIUM" ? "bg-yellow-500/10 text-yellow-400" : "bg-white/5 text-neutral-500"
                  }`}>
                    {u.plan}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-500">
                  {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
