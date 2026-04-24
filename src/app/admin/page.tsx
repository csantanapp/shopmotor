"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import Link from "next/link";

interface Stats {
  users: { pf: number; pj: number; total: number };
  vehicles: { total: number; cars: number; motos: number };
  totalVehicleValue: number;
  recentUsers: any[];
  recentStores: any[];
  vehiclesByMonth: { month: string; count: number }[];
  usersByMonth: { month: string; count: number }[];
  revenue: { total: number; count: number; byPlan: any[]; byMonth: any[]; recent: any[] };
}

function StatCard({ label, value, icon, color, sub }: {
  label: string; value: string | number; icon: string; color: string; sub?: string;
}) {
  return (
    <div className="bg-[#111414] border border-white/5 rounded-2xl p-4 flex items-start gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon name={icon} className="text-lg" />
      </div>
      <div>
        <p className="text-xl font-black text-white">{value}</p>
        <p className="text-sm text-neutral-400 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-neutral-600 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function MonthBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const d = new Date(label);
  const mon = d.toLocaleDateString("pt-BR", { month: "short" });
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <span className="text-xs text-neutral-400 font-bold">{value}</span>
      <div className="w-full bg-white/5 rounded-full overflow-hidden" style={{ height: 80 }}>
        <div
          className="w-full bg-primary-container rounded-full transition-all"
          style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
        />
      </div>
      <span className="text-[10px] text-neutral-600 capitalize">{mon}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats").then(r => r.json()).then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return <div className="p-8 text-red-400">Erro ao carregar dados.</div>;

  const price = stats.totalVehicleValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
  const revenueTotal = stats.revenue.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
  const maxVeh = Math.max(...(stats.vehiclesByMonth?.map(m => m.count) ?? [1]), 1);
  const maxUsr = Math.max(...(stats.usersByMonth?.map(m => m.count) ?? [1]), 1);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Dashboard</h1>
        <p className="text-neutral-500 text-sm mt-1">Visão geral do ShopMotor</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        <StatCard
          label="Pessoas Físicas"
          value={stats.users.pf.toLocaleString("pt-BR")}
          icon="person"
          color="bg-blue-500/10 text-blue-400"
          sub={`${stats.users.total} usuários no total`}
        />
        <StatCard
          label="Lojas (PJ)"
          value={stats.users.pj.toLocaleString("pt-BR")}
          icon="storefront"
          color="bg-purple-500/10 text-purple-400"
        />
        <StatCard
          label="Total de Anúncios"
          value={stats.vehicles.total.toLocaleString("pt-BR")}
          icon="directions_car"
          color="bg-primary-container/20 text-primary-container"
          sub={`${stats.vehicles.cars} carros · ${stats.vehicles.motos} motos`}
        />
        <StatCard
          label="Valor dos Anúncios"
          value={price}
          icon="attach_money"
          color="bg-green-500/10 text-green-400"
          sub="soma de todos os veículos ativos"
        />
        <StatCard
          label="Receita (Impulsionamentos)"
          value={revenueTotal}
          icon="rocket_launch"
          color="bg-yellow-500/10 text-yellow-400"
          sub={`${stats.revenue.count} pagamentos aprovados`}
        />
      </div>

      {/* Sub stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#111414] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <Icon name="directions_car" className="text-3xl text-neutral-400" />
          <div>
            <p className="text-xl font-black text-white">{stats.vehicles.cars.toLocaleString("pt-BR")}</p>
            <p className="text-xs text-neutral-500">Anúncios de Carros</p>
          </div>
        </div>
        <div className="bg-[#111414] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <Icon name="two_wheeler" className="text-3xl text-neutral-400" />
          <div>
            <p className="text-xl font-black text-white">{stats.vehicles.motos.toLocaleString("pt-BR")}</p>
            <p className="text-xs text-neutral-500">Anúncios de Motos</p>
          </div>
        </div>
        <div className="bg-[#111414] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <Icon name="group" className="text-3xl text-neutral-400" />
          <div>
            <p className="text-xl font-black text-white">{stats.users.total.toLocaleString("pt-BR")}</p>
            <p className="text-xs text-neutral-500">Total de Cadastros</p>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Vehicles by month */}
        <div className="bg-[#111414] border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-black text-white mb-1">Novos Anúncios</h3>
          <p className="text-xs text-neutral-500 mb-6">últimos 6 meses</p>
          <div className="flex items-end gap-2 h-24">
            {(stats.vehiclesByMonth as any[]).map((m, i) => (
              <MonthBar key={i} label={m.month} value={m.count} max={maxVeh} />
            ))}
          </div>
        </div>

        {/* Users by month */}
        <div className="bg-[#111414] border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-black text-white mb-1">Novos Cadastros</h3>
          <p className="text-xs text-neutral-500 mb-6">últimos 6 meses</p>
          <div className="flex items-end gap-2 h-24">
            {(stats.usersByMonth as any[]).map((m, i) => (
              <MonthBar key={i} label={m.month} value={m.count} max={maxUsr} />
            ))}
          </div>
        </div>
      </div>

      {/* Recent tables */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="bg-[#111414] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-black text-white">Últimos Cadastros PF</h3>
            <Link href="/admin/usuarios" className="text-xs text-primary-container hover:underline">Ver todos</Link>
          </div>
          <div className="divide-y divide-white/5">
            {stats.recentUsers.slice(0, 6).map((u: any) => (
              <div key={u.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-semibold">{u.name}</p>
                  <p className="text-xs text-neutral-500">{u.email}</p>
                </div>
                <p className="text-xs text-neutral-600">
                  {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent stores */}
        <div className="bg-[#111414] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-black text-white">Últimas Lojas Cadastradas</h3>
            <Link href="/admin/lojas" className="text-xs text-primary-container hover:underline">Ver todas</Link>
          </div>
          <div className="divide-y divide-white/5">
            {stats.recentStores.slice(0, 6).map((s: any) => (
              <div key={s.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-semibold">{s.tradeName || s.companyName || s.name}</p>
                  <p className="text-xs text-neutral-500">{s.city}/{s.state}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-400 font-bold">{s._count.vehicles} anúncios</p>
                  <p className="text-xs text-neutral-600">{new Date(s.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
