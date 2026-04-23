"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default function AdminLojas() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats").then(r => r.json()).then(d => {
      setStores(d.recentStores ?? []);
      setLoading(false);
    });
  }, []);

  const filtered = stores.filter(s => {
    const name = (s.tradeName || s.companyName || s.name || "").toLowerCase();
    return name.includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Lojas (PJ)</h1>
          <p className="text-neutral-500 text-sm mt-1">{stores.length} lojas cadastradas recentemente</p>
        </div>
        <div className="flex items-center gap-3 bg-[#111414] border border-white/5 rounded-xl px-4 py-2.5">
          <Icon name="search" className="text-neutral-500 text-lg" />
          <input
            className="bg-transparent outline-none text-sm text-white placeholder:text-neutral-600 w-48"
            placeholder="Buscar loja..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-[#111414] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest">Loja</th>
              <th className="text-left px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest">E-mail</th>
              <th className="text-left px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest">Cidade</th>
              <th className="text-left px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest">Anúncios</th>
              <th className="text-left px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest">Perfil</th>
              <th className="text-left px-6 py-4 text-xs font-black text-neutral-500 uppercase tracking-widest">Cadastro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-neutral-600">Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-neutral-600">Nenhuma loja encontrada.</td></tr>
            ) : filtered.map((s: any) => (
              <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm text-white font-semibold">{s.tradeName || s.companyName || s.name}</p>
                  {s.storeSlug && <p className="text-xs text-neutral-600">/{s.storeSlug}</p>}
                </td>
                <td className="px-6 py-4 text-sm text-neutral-400">{s.email}</td>
                <td className="px-6 py-4 text-sm text-neutral-400">{s.city ? `${s.city}/${s.state}` : "—"}</td>
                <td className="px-6 py-4">
                  <span className="text-sm font-black text-white">{s._count.vehicles}</span>
                </td>
                <td className="px-6 py-4">
                  {s.storeSlug && (
                    <Link
                      href={`/loja/${s.storeSlug}`}
                      target="_blank"
                      className="text-xs text-primary-container hover:underline flex items-center gap-1"
                    >
                      <Icon name="open_in_new" className="text-xs" />
                      Ver loja
                    </Link>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-neutral-500">
                  {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
