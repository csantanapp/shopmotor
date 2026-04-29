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
  cities: { country: string; region: string | null; city: string | null; count: number }[];
};

function LineChart({ days }: { days: { date: string; views: number }[] }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; views: number } | null>(null);

  const W = 800, H = 200, PL = 44, PR = 12, PT = 12, PB = 28;
  const chartW = W - PL - PR;
  const chartH = H - PT - PB;

  const maxVal = Math.max(...days.map(d => d.views), 1);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(r => Math.round(r * maxVal));

  function px(i: number) { return PL + (i / Math.max(days.length - 1, 1)) * chartW; }
  function py(v: number) { return PT + chartH - (v / maxVal) * chartH; }

  const pts = days.map((d, i) => ({ x: px(i), y: py(d.views), ...d }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${pts[pts.length - 1].x.toFixed(1)},${(PT + chartH).toFixed(1)} L${PL},${(PT + chartH).toFixed(1)} Z`;

  const xLabels = days.reduce((acc: { i: number; label: string }[], d, i) => {
    const day = new Date(d.date + "T12:00:00").getDate();
    if (i === 0 || day === 1 || day === 7 || day === 14 || day === 21 || i === days.length - 1)
      acc.push({ i, label: new Date(d.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) });
    return acc;
  }, []);

  return (
    <div className="bg-[#111414] border border-white/5 rounded-2xl p-6 mb-6">
      <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Visitas — últimos 30 dias</p>
      <div className="relative w-full" style={{ paddingBottom: `${(H / W) * 100}%` }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full" onMouseLeave={() => setTooltip(null)}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EAB308" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#EAB308" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map(v => {
            const y = py(v);
            return (
              <g key={v}>
                <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <text x={PL - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#525252">{v}</text>
              </g>
            );
          })}

          {/* X axis labels */}
          {xLabels.map(({ i, label }) => (
            <text key={i} x={px(i)} y={H - 4} textAnchor="middle" fontSize="10" fill="#525252">{label}</text>
          ))}

          {/* Area fill */}
          <path d={areaPath} fill="url(#areaGrad)" />

          {/* Line */}
          <path d={linePath} fill="none" stroke="#EAB308" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

          {/* Dots + hover zones */}
          {pts.map((p, i) => (
            <g key={i} onMouseEnter={() => setTooltip({ x: p.x, y: p.y, label: new Date(p.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), views: p.views })}>
              <rect x={p.x - chartW / days.length / 2} y={PT} width={chartW / days.length} height={chartH} fill="transparent" />
              {p.views > 0 && <circle cx={p.x} cy={p.y} r="3" fill="#EAB308" stroke="#111414" strokeWidth="1.5" />}
            </g>
          ))}

          {/* Tooltip */}
          {tooltip && (() => {
            const tw = 90, th = 34;
            const tx = Math.min(Math.max(tooltip.x - tw / 2, PL), W - PR - tw);
            const ty = tooltip.y - th - 8 < PT ? tooltip.y + 8 : tooltip.y - th - 8;
            return (
              <g pointerEvents="none">
                <line x1={tooltip.x} y1={PT} x2={tooltip.x} y2={PT + chartH} stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4,3" />
                <rect x={tx} y={ty} width={tw} height={th} rx="6" fill="#1e2222" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <text x={tx + tw / 2} y={ty + 13} textAnchor="middle" fontSize="10" fill="#a3a3a3">{tooltip.label}</text>
                <text x={tx + tw / 2} y={ty + 26} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#EAB308">{tooltip.views} visitas</text>
              </g>
            );
          })()}
        </svg>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-2 mt-3">
        <span className="w-6 h-0.5 bg-yellow-500 rounded" />
        <span className="text-xs text-neutral-500">Visitas site</span>
      </div>
    </div>
  );
}

const COUNTRY_NAMES: Record<string, string> = {
  BR: "Brasil", US: "EUA", PT: "Portugal", AR: "Argentina", MX: "México",
  DE: "Alemanha", FR: "França", ES: "Espanha", GB: "Reino Unido", IT: "Itália",
};

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="p-8 flex items-center gap-3 text-neutral-500 text-sm">
      <div className="w-5 h-5 border-2 border-neutral-600 border-t-transparent rounded-full animate-spin" />
      Carregando analytics...
    </div>
  );

  if (error) return <div className="p-8 text-red-400 text-sm">Erro ao carregar analytics: {error}</div>;
  if (!data) return null;

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
      <LineChart days={data.days} />

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
          <p className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-5">Geolocalização</p>
          <div className="space-y-3">
            {data.cities.map((c, i) => {
              const label = [c.city, c.region, COUNTRY_NAMES[c.country] ?? c.country].filter(Boolean).join(", ");
              return (
                <div key={`${c.country}-${c.region}-${c.city}-${i}`} className="flex items-center gap-3">
                  <span className="text-xs text-neutral-600 w-4">{i + 1}</span>
                  <span className="flex-1 text-sm text-white">{label}</span>
                  <span className="text-sm text-neutral-400 tabular-nums">{c.count.toLocaleString("pt-BR")}</span>
                </div>
              );
            })}
            {data.cities.length === 0 && <p className="text-neutral-600 text-sm">Sem dados ainda.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
