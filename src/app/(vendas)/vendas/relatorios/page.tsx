"use client";

import ErpLayout from "@/components/erp/ErpLayout";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const GOLD = "#ffd709";
const GOLD2 = "#e6c200";
const BORDER = "rgba(0,0,0,0.08)";
const CARD_BG = "#ffffff";
const MUTED = "rgba(0,0,0,0.35)";
const TT = { background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 8, color: "#111" };

const searched = [
  { name: "Toyota Corolla", v: 8900 }, { name: "Honda Civic", v: 7600 },
  { name: "Jeep Compass", v: 6420 }, { name: "VW T-Cross", v: 5210 },
  { name: "Hyundai HB20", v: 4800 }, { name: "Honda CB 500F", v: 3400 },
];
const brands = [
  { name: "Toyota", v: 28, fill: GOLD },
  { name: "Honda", v: 24, fill: GOLD2 },
  { name: "VW", v: 18, fill: "#3b82f6" },
  { name: "Jeep", v: 16, fill: "#22c55e" },
  { name: "Outros", v: 14, fill: "#9ca3af" },
];
const cities = [
  { city: "São Paulo, SP", demand: 38 },
  { city: "Rio de Janeiro, RJ", demand: 22 },
  { city: "Belo Horizonte, MG", demand: 14 },
  { city: "Curitiba, PR", demand: 11 },
  { city: "Porto Alegre, RS", demand: 8 },
];
const origin = [
  { name: "Site", v: 62 }, { name: "Financiamento", v: 21 },
  { name: "Seguro", v: 12 }, { name: "Indicação", v: 5 },
];

export default function RelatoriosPage() {
  return (
    <ErpLayout title="Relatórios / BI" subtitle="Inteligência de mercado e demanda">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
          <h3 className="font-black text-gray-900 mb-1">Veículos mais buscados</h3>
          <p className="text-xs text-gray-400 mb-4">Top 6 — últimos 30 dias</p>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={searched} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} horizontal={false} />
                <XAxis type="number" stroke={MUTED} fontSize={11} />
                <YAxis type="category" dataKey="name" stroke={MUTED} fontSize={11} width={110} />
                <Tooltip contentStyle={TT} />
                <Bar dataKey="v" fill={GOLD} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
          <h3 className="font-black text-gray-900 mb-1">Marcas mais populares</h3>
          <p className="text-xs text-gray-400 mb-4">% do total</p>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={brands} dataKey="v" innerRadius={55} outerRadius={95} paddingAngle={3}>
                  {brands.map((b) => <Cell key={b.name} fill={b.fill} />)}
                </Pie>
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11, color: MUTED }} />
                <Tooltip contentStyle={TT} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
          <h3 className="font-black text-gray-900 mb-1">Cidades com mais demanda</h3>
          <p className="text-xs text-gray-400 mb-4">% do total de buscas</p>
          <ul className="space-y-3">
            {cities.map((c) => (
              <li key={c.city}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-gray-800">{c.city}</span>
                  <span className="font-black text-yellow-700">{c.demand}%</span>
                </div>
                <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-primary-container" style={{ width: `${c.demand * 2.5}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
          <h3 className="font-black text-gray-900 mb-1">Leads por origem</h3>
          <p className="text-xs text-gray-400 mb-4">% do total mensal</p>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={origin}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} vertical={false} />
                <XAxis dataKey="name" stroke={MUTED} fontSize={12} />
                <YAxis stroke={MUTED} fontSize={12} />
                <Tooltip contentStyle={TT} />
                <Bar dataKey="v" fill={GOLD2} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </ErpLayout>
  );
}
