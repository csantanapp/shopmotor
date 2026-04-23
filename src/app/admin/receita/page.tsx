"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";

const planLabels: Record<string, string> = {
  TURBO: "Turbo",
  DESTAQUE: "Destaque",
  SUPER_DESTAQUE: "Super Destaque",
  ELITE: "Elite",
};

const statusColor: Record<string, string> = {
  approved: "bg-green-500/10 text-green-400",
  pending:  "bg-yellow-500/10 text-yellow-400",
  rejected: "bg-red-500/10 text-red-400",
};

const statusLabel: Record<string, string> = {
  approved: "Aprovado",
  pending:  "Pendente",
  rejected: "Recusado",
};

function MonthBar({ label, total, max }: { label: string; total: number; max: number }) {
  const pct = max > 0 ? (total / max) * 100 : 0;
  const d = new Date(label);
  const mon = d.toLocaleDateString("pt-BR", { month: "short" });
  const val = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <span className="text-xs text-neutral-400 font-bold">{val}</span>
      <div className="w-full bg-white/5 rounded-full overflow-hidden" style={{ height: 80 }}>
        <div className="w-full bg-yellow-400/70 rounded-full" style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }} />
      </div>
      <span className="text-[10px] text-neutral-600 capitalize">{mon}</span>
    </div>
  );
}

export default function AdminReceita() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats").then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const revenue = data?.revenue;
  const total = (revenue?.total ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
  const approved = revenue?.recent?.filter((p: any) => p.status === "approved") ?? [];
  const pending  = revenue?.recent?.filter((p: any) => p.status === "pending") ?? [];
  const maxMonth = Math.max(...(revenue?.byMonth?.map((m: any) => m.total) ?? [1]), 1);

  const filtered = (revenue?.recent ?? []).filter((p: any) => {
    const q = search.toLowerCase();
    return (
      p.user?.name?.toLowerCase().includes(q) ||
      p.user?.email?.toLowerCase().includes(q) ||
      p.vehicle?.brand?.toLowerCase().includes(q) ||
      p.vehicle?.model?.toLowerCase().includes(q) ||
      p.plan?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Receita</h1>
        <p className="text-neutral-500 text-sm mt-1">Receita gerada por impulsionamentos de anúncios</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-[#111414] border border-white/5 rounded-2xl p-6 col-span-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">
              <Icon name="payments" className="text-yellow-400 text-xl" />
            </div>
            <p className="text-xs text-neutral-500 font-black uppercase tracking-widest">Receita Total</p>
          </div>
          <p className="text-3xl font-black text-white">{total}</p>
          <p className="text-xs text-neutral-600 mt-1">{approved.length} pagamentos aprovados</p>
        </div>

        <div className="bg-[#111414] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="check_circle" className="text-green-400" />
            <p className="text-xs text-neutral-500">Aprovados</p>
          </div>
          <p className="text-2xl font-black text-white">{approved.length}</p>
        </div>

        <div className="bg-[#111414] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="schedule" className="text-yellow-400" />
            <p className="text-xs text-neutral-500">Pendentes</p>
          </div>
          <p className="text-2xl font-black text-white">{pending.length}</p>
        </div>
      </div>

      {/* Chart + by plan */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 bg-[#111414] border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-black text-white mb-1">Receita por Mês</h3>
          <p className="text-xs text-neutral-500 mb-6">últimos 6 meses — apenas aprovados</p>
          {revenue?.byMonth?.length > 0 ? (
            <div className="flex items-end gap-3 h-24">
              {revenue.byMonth.map((m: any, i: number) => (
                <MonthBar key={i} label={m.month} total={m.total} max={maxMonth} />
              ))}
            </div>
          ) : (
            <p className="text-neutral-600 text-sm">Nenhum pagamento aprovado ainda.</p>
          )}
        </div>

        <div className="bg-[#111414] border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-black text-white mb-4">Por Plano</h3>
          <div className="space-y-3">
            {(revenue?.byPlan ?? []).map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-semibold">{planLabels[p.plan] ?? p.plan}</p>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${statusColor[p.status] ?? "bg-white/5 text-neutral-400"}`}>
                    {statusLabel[p.status] ?? p.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white">
                    {Number(p.total).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-neutral-600">{p.count}x</p>
                </div>
              </div>
            ))}
            {(!revenue?.byPlan?.length) && <p className="text-neutral-600 text-sm">Sem dados ainda.</p>}
          </div>
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-[#111414] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-black text-white">Transações</h3>
          <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
            <Icon name="search" className="text-neutral-500 text-sm" />
            <input
              className="bg-transparent outline-none text-sm text-white placeholder:text-neutral-600 w-40"
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-6 py-3 text-xs font-black text-neutral-500 uppercase tracking-widest">Usuário</th>
              <th className="text-left px-6 py-3 text-xs font-black text-neutral-500 uppercase tracking-widest">Veículo</th>
              <th className="text-left px-6 py-3 text-xs font-black text-neutral-500 uppercase tracking-widest">Plano</th>
              <th className="text-left px-6 py-3 text-xs font-black text-neutral-500 uppercase tracking-widest">Valor</th>
              <th className="text-left px-6 py-3 text-xs font-black text-neutral-500 uppercase tracking-widest">Status</th>
              <th className="text-left px-6 py-3 text-xs font-black text-neutral-500 uppercase tracking-widest">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-neutral-600">Nenhuma transação.</td></tr>
            ) : filtered.map((p: any) => (
              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-3">
                  <p className="text-sm text-white font-semibold">{p.user?.name ?? "—"}</p>
                  <p className="text-xs text-neutral-500">{p.user?.email}</p>
                </td>
                <td className="px-6 py-3 text-sm text-neutral-400">
                  {p.vehicle ? `${p.vehicle.brand} ${p.vehicle.model}` : "—"}
                </td>
                <td className="px-6 py-3">
                  <span className="text-xs font-black text-neutral-300 bg-white/5 px-2 py-1 rounded">
                    {planLabels[p.plan] ?? p.plan}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm font-black text-white">
                  {Number(p.amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-3">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full ${statusColor[p.status] ?? "bg-white/5 text-neutral-400"}`}>
                    {statusLabel[p.status] ?? p.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm text-neutral-500">
                  {new Date(p.createdAt).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
