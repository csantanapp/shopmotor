"use client";

import { useEffect, useState, useCallback } from "react";
import Icon from "@/components/ui/Icon";
import { STORE_PLANS } from "@/lib/store-plans";

const STATUS_LABEL: Record<string, string> = { active: "Ativo", pending: "Pendente", cancelled: "Cancelado", expired: "Expirado" };
const STATUS_COLOR: Record<string, string> = {
  active: "bg-green-500/10 text-green-400",
  pending: "bg-yellow-500/10 text-yellow-400",
  cancelled: "bg-neutral-500/10 text-neutral-500",
  expired: "bg-red-500/10 text-red-400",
};
const PLAN_COLOR: Record<string, string> = {
  STARTER: "text-zinc-400", PRO: "text-yellow-400", ELITE: "text-orange-400",
};

type Sub = {
  id: string; plan: string; status: string; amount: number;
  startsAt: string | null; endsAt: string | null; createdAt: string;
  user: { id: string; name: string; email: string; tradeName: string | null; storeSlug: string | null };
};

export default function AdminAssinaturas() {
  const [items, setItems] = useState<Sub[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState(0);
  const [selected, setSelected] = useState<Sub | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    if (planFilter) params.set("plan", planFilter);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/assinaturas?${params}`);
    const data = await res.json();
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
    setPages(data.pages ?? 1);
    setRevenue(data.revenue ?? 0);
    setLoading(false);
  }, [page, search, planFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    await fetch("/api/admin/assinaturas", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (selected?.id === id) setSelected(s => s ? { ...s, status } : s);
    load();
  }

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Assinaturas — Lojistas</h1>
          <p className="text-neutral-500 text-sm mt-1">{total} assinaturas · Receita ativa: {fmt(revenue)}</p>
        </div>
        <a href="/planos" target="_blank" className="text-xs text-primary-container border border-white/10 px-4 py-2 rounded-xl hover:border-white/20">
          Ver página de planos ↗
        </a>
      </div>

      {/* KPI por plano */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {Object.values(STORE_PLANS).map(plan => (
          <button key={plan.key} onClick={() => { setPlanFilter(planFilter === plan.key ? "" : plan.key); setPage(1); }}
            className={`bg-[#111414] border rounded-xl p-4 text-left transition-all ${planFilter === plan.key ? "border-primary-container" : "border-white/5 hover:border-white/10"}`}>
            <p className="text-sm text-neutral-500 mb-1">{plan.emoji} {plan.name}</p>
            <p className="text-xl font-black text-white">{fmt(plan.price)}<span className="text-xs text-neutral-500 font-normal">/mês</span></p>
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-base" />
          <input className="w-full bg-[#111414] border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:border-primary-container"
            placeholder="Buscar loja ou e-mail..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        {["active", "pending", "cancelled", "expired"].map(s => (
          <button key={s} onClick={() => { setStatusFilter(statusFilter === s ? "" : s); setPage(1); }}
            className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all ${statusFilter === s ? "border-primary-container text-primary-container" : "border-white/10 text-neutral-400 hover:border-white/20"}`}>
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Tabela */}
        <div className="flex-1 min-w-0">
          <div className="bg-[#111414] border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-neutral-500 text-xs uppercase tracking-widest">
                  <th className="text-left px-5 py-3 font-bold">Loja</th>
                  <th className="text-left px-5 py-3 font-bold">Plano</th>
                  <th className="text-left px-5 py-3 font-bold hidden md:table-cell">Vencimento</th>
                  <th className="text-left px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading && <tr><td colSpan={5} className="text-center py-10 text-neutral-600 text-sm">Carregando...</td></tr>}
                {!loading && items.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-neutral-600 text-sm">Nenhuma assinatura encontrada.</td></tr>}
                {items.map(sub => (
                  <tr key={sub.id} onClick={() => setSelected(sub)}
                    className={`hover:bg-white/3 cursor-pointer transition-colors ${selected?.id === sub.id ? "bg-white/5" : ""}`}>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-white">{sub.user.tradeName || sub.user.name}</p>
                      <p className="text-xs text-neutral-500">{sub.user.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-sm font-black ${PLAN_COLOR[sub.plan]}`}>
                        {STORE_PLANS[sub.plan as keyof typeof STORE_PLANS]?.emoji} {sub.plan}
                      </span>
                      <p className="text-xs text-neutral-600">{fmt(sub.amount)}</p>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <p className="text-xs text-neutral-400">
                        {sub.endsAt ? new Date(sub.endsAt).toLocaleDateString("pt-BR") : "—"}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLOR[sub.status]}`}>
                        {STATUS_LABEL[sub.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <p className="text-xs text-neutral-600">{new Date(sub.createdAt).toLocaleDateString("pt-BR")}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-neutral-500">
              <span>Página {page} de {pages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-white/10 disabled:opacity-30">Anterior</button>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                  className="px-3 py-1.5 rounded-lg border border-white/10 disabled:opacity-30">Próxima</button>
              </div>
            </div>
          )}
        </div>

        {/* Painel detalhe */}
        {selected && (
          <div className="w-72 flex-shrink-0">
            <div className="bg-[#111414] border border-white/5 rounded-2xl p-5 sticky top-8">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black text-white text-sm">Detalhes</h3>
                <button onClick={() => setSelected(null)} className="text-neutral-500 hover:text-white">
                  <Icon name="close" className="text-base" />
                </button>
              </div>
              <div className="space-y-3 text-sm mb-5">
                {[
                  { label: "Loja", value: selected.user.tradeName || selected.user.name },
                  { label: "E-mail", value: selected.user.email },
                  { label: "Plano", value: `${STORE_PLANS[selected.plan as keyof typeof STORE_PLANS]?.emoji ?? ""} ${selected.plan}` },
                  { label: "Valor", value: fmt(selected.amount) },
                  { label: "Início", value: selected.startsAt ? new Date(selected.startsAt).toLocaleDateString("pt-BR") : "—" },
                  { label: "Vencimento", value: selected.endsAt ? new Date(selected.endsAt).toLocaleDateString("pt-BR") : "—" },
                ].map(r => (
                  <div key={r.label}>
                    <p className="text-xs text-neutral-600 uppercase tracking-wider">{r.label}</p>
                    <p className="text-white font-semibold">{r.value}</p>
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Alterar status</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(STATUS_LABEL).map(([key, label]) => (
                    <button key={key} onClick={() => updateStatus(selected.id, key)}
                      className={`text-xs font-bold py-2 rounded-lg border transition-all ${selected.status === key ? "border-primary-container bg-primary-container/10 text-primary-container" : "border-white/10 text-neutral-400 hover:border-white/20"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {selected.user.storeSlug && (
                <a href={`/loja/${selected.user.storeSlug}`} target="_blank"
                  className="block w-full text-center text-xs font-bold border border-white/10 text-neutral-400 py-2 rounded-xl hover:border-white/20 transition-colors">
                  Ver loja ↗
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
