"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";

type AnalyticsData = {
  total: number;
  last30Total: number;
  uniqueSessions: number;
  days: { date: string; views: number }[];
  devices: { device: string; count: number }[];
  sources: { source: string; count: number }[];
  pages: { path: string; count: number }[];
  countries: { country: string; count: number }[];
};

const COUNTRY_NAMES: Record<string, string> = {
  BR: "Brasil", US: "EUA", PT: "Portugal", AR: "Argentina", MX: "México",
  DE: "Alemanha", FR: "França", ES: "Espanha", GB: "Reino Unido", IT: "Itália",
};

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics").then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="p-8 flex items-center gap-3 text-neutral-500 text-sm">
      <div className="w-5 h-5 border-2 border-neutral-600 border-t-transparent rounded-full animate-spin" />
      Carregando analytics...
    </div>
  );

  if (!data) return null;

  const maxViews = Math.max(...data.days.map(d => d.views), 1);
  const totalDevices = data.devices.reduce((a, b) => a + b.count, 0) || 1;
  const totalSources = data.sources.reduce((a, b) => a + b.count, 0) || 1;

  const deviceIcon: Record<string, string> = { mobile: "smartphone", desktop: "computer", tablet: "tablet_mac" };

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Analytics</h1>
        <p className="text-neutral-500 text-sm mt-1">Visitas e comportamento dos últimos 30 dias</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total de visitas", value: data.total.toLocaleString("pt-BR"), icon: "visibility" },
          { label: "Visitas (30 dias)", value: data.last30Total.toLocaleString("pt-BR"), icon: "trending_up" },
          { label: "Sessões únicas", value: data.uniqueSessions.toLocaleString("pt-BR"), icon: "person" },
          { label: "Média diária", value: Math.round(data.last30Total / 30).toLocaleString("pt-BR"), icon: "calendar_today" },
        ].map(card => (
          <div key={card.label} className="bg-[#111414] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Icon name={card.icon} className="text-neutral-500 text-base" />
              <span className="text-xs text-neutral-500 uppercase tracking-widest font-bold">{card.label}</span>
            </div>
            <p className="text-3xl font-black text-white">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Line Chart */}
      <div className="bg-[#111414] border border-white/5 rounded-2xl p-6 mb-6">
        <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-6">Visitas — últimos 30 dias</p>
        <div className="flex items-end gap-1 h-40">
          {data.days.map(d => {
            const pct = (d.views / maxViews) * 100;
            const label = new Date(d.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className="w-full bg-primary-container/60 hover:bg-primary-container rounded-t transition-all cursor-default"
                  style={{ height: `${Math.max(pct, 2)}%` }}
                />
                {/* tooltip */}
                <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center pointer-events-none z-10">
                  <div className="bg-[#1e2222] border border-white/10 rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap">
                    {label}: <span className="font-bold">{d.views}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-neutral-600">{data.days[0]?.date.slice(5).replace("-", "/")}</span>
          <span className="text-xs text-neutral-600">{data.days[29]?.date.slice(5).replace("-", "/")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Devices */}
        <div className="bg-[#111414] border border-white/5 rounded-2xl p-6">
          <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-5">Dispositivos</p>
          <div className="space-y-4">
            {data.devices.map(d => {
              const pct = Math.round((d.count / totalDevices) * 100);
              const labels: Record<string, string> = { mobile: "Mobile", desktop: "Desktop", tablet: "Tablet", unknown: "Desconhecido" };
              return (
                <div key={d.device}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon name={deviceIcon[d.device] ?? "devices"} className="text-neutral-500 text-sm" />
                      <span className="text-sm text-white">{labels[d.device] ?? d.device}</span>
                    </div>
                    <span className="text-sm text-neutral-400">{pct}% · {d.count.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-container rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {data.devices.length === 0 && <p className="text-neutral-600 text-sm">Sem dados ainda.</p>}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-[#111414] border border-white/5 rounded-2xl p-6">
          <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-5">Origem do tráfego</p>
          <div className="space-y-3">
            {data.sources.map(s => {
              const pct = Math.round((s.count / totalSources) * 100);
              return (
                <div key={s.source}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white truncate max-w-[70%]">{s.source}</span>
                    <span className="text-sm text-neutral-400">{pct}% · {s.count.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-on-primary-container/40 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {data.sources.length === 0 && <p className="text-neutral-600 text-sm">Sem dados ainda.</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-[#111414] border border-white/5 rounded-2xl p-6">
          <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-5">Páginas mais visitadas</p>
          <div className="space-y-3">
            {data.pages.map((p, i) => (
              <div key={p.path} className="flex items-center gap-3">
                <span className="text-xs text-neutral-600 w-4">{i + 1}</span>
                <span className="flex-1 text-sm text-white font-mono truncate">{p.path}</span>
                <span className="text-sm text-neutral-400 tabular-nums">{p.count.toLocaleString("pt-BR")}</span>
              </div>
            ))}
            {data.pages.length === 0 && <p className="text-neutral-600 text-sm">Sem dados ainda.</p>}
          </div>
        </div>

        {/* Geolocation */}
        <div className="bg-[#111414] border border-white/5 rounded-2xl p-6">
          <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-5">Geolocalização (país)</p>
          <div className="space-y-3">
            {data.countries.map((c, i) => (
              <div key={c.country} className="flex items-center gap-3">
                <span className="text-xs text-neutral-600 w-4">{i + 1}</span>
                <span className="flex-1 text-sm text-white">{COUNTRY_NAMES[c.country] ?? c.country}</span>
                <span className="text-sm text-neutral-400 tabular-nums">{c.count.toLocaleString("pt-BR")}</span>
              </div>
            ))}
            {data.countries.length === 0 && <p className="text-neutral-600 text-sm">Sem dados de país ainda. Requer header x-vercel-ip-country ou cf-ipcountry.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
