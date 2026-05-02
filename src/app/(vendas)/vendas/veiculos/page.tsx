"use client";

import { useState } from "react";
import ErpLayout from "@/components/erp/ErpLayout";
import ErpStatusBadge from "@/components/erp/ErpStatusBadge";
import Icon from "@/components/ui/Icon";

type Vehicle = {
  id: number; name: string; brand: string; year: number; price: number; fipe: number;
  status: "ativo" | "vendido" | "pausado"; daysInStock: number;
  views: number; clicks: number; leads: number; score: number;
  scoreBreakdown: { label: string; value: number }[];
  suggestions: ("impulsionar" | "fotos" | "preco" | "responder")[];
};

const vehicles: Vehicle[] = [
  { id: 1, name: "Toyota Corolla XEi 2023", brand: "Toyota", year: 2023, price: 142900, fipe: 145200, status: "ativo", daysInStock: 12, views: 4210, clicks: 312, leads: 38, score: 92, scoreBreakdown: [{ label: "Interesse", value: 95 }, { label: "Engajamento", value: 88 }, { label: "Preço vs FIPE", value: 96 }, { label: "Qualidade", value: 90 }, { label: "Atendimento", value: 89 }], suggestions: ["impulsionar"] },
  { id: 2, name: "Jeep Compass Limited 2024", brand: "Jeep", year: 2024, price: 198500, fipe: 201000, status: "ativo", daysInStock: 9, views: 3890, clicks: 270, leads: 31, score: 86, scoreBreakdown: [{ label: "Interesse", value: 88 }, { label: "Engajamento", value: 82 }, { label: "Preço vs FIPE", value: 92 }, { label: "Qualidade", value: 85 }, { label: "Atendimento", value: 83 }], suggestions: ["impulsionar", "responder"] },
  { id: 3, name: "Honda Civic Touring 2022", brand: "Honda", year: 2022, price: 154000, fipe: 151000, status: "ativo", daysInStock: 21, views: 3120, clicks: 218, leads: 24, score: 74, scoreBreakdown: [{ label: "Interesse", value: 80 }, { label: "Engajamento", value: 72 }, { label: "Preço vs FIPE", value: 65 }, { label: "Qualidade", value: 80 }, { label: "Atendimento", value: 73 }], suggestions: ["preco", "fotos"] },
  { id: 4, name: "VW T-Cross Highline 2023", brand: "VW", year: 2023, price: 138900, fipe: 134500, status: "pausado", daysInStock: 45, views: 870, clicks: 41, leads: 4, score: 32, scoreBreakdown: [{ label: "Interesse", value: 30 }, { label: "Engajamento", value: 22 }, { label: "Preço vs FIPE", value: 48 }, { label: "Qualidade", value: 35 }, { label: "Atendimento", value: 25 }], suggestions: ["preco", "fotos", "impulsionar"] },
  { id: 5, name: "Hyundai HB20 Sense 2022", brand: "Hyundai", year: 2022, price: 78900, fipe: 76200, status: "vendido", daysInStock: 18, views: 5210, clicks: 410, leads: 52, score: 100, scoreBreakdown: [{ label: "Interesse", value: 100 }, { label: "Engajamento", value: 100 }, { label: "Preço vs FIPE", value: 100 }, { label: "Qualidade", value: 100 }, { label: "Atendimento", value: 100 }], suggestions: [] },
  { id: 6, name: "Honda CB 500F 2024", brand: "Honda", year: 2024, price: 42500, fipe: 43800, status: "ativo", daysInStock: 7, views: 2110, clicks: 188, leads: 19, score: 78, scoreBreakdown: [{ label: "Interesse", value: 82 }, { label: "Engajamento", value: 78 }, { label: "Preço vs FIPE", value: 88 }, { label: "Qualidade", value: 70 }, { label: "Atendimento", value: 72 }], suggestions: ["fotos"] },
];

const scoreLabel = (s: number) =>
  s >= 80 ? { label: "Alta chance", cls: "bg-green-100 text-green-700 border-green-300" }
  : s >= 60 ? { label: "Média chance", cls: "bg-yellow-100 text-yellow-700 border-yellow-300" }
  : { label: "Baixa chance", cls: "bg-red-100 text-red-600 border-red-300" };

const suggMap = {
  impulsionar: { label: "Impulsionar", icon: "rocket_launch" },
  fotos: { label: "Melhorar fotos", icon: "photo_camera" },
  preco: { label: "Ajustar preço", icon: "sell" },
  responder: { label: "Responder leads", icon: "chat" },
} as const;

export default function VeiculosPage() {
  const [toast, setToast] = useState("");
  const fire = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  return (
    <ErpLayout
      title="Gestão de Veículos"
      subtitle={`${vehicles.length} veículos · sistema sugere ações para vender mais rápido`}
      action={
        <button onClick={() => fire("Abrindo cadastro de veículo…")} className="flex items-center gap-2 rounded-xl bg-primary-container px-4 py-2 text-sm font-black text-black hover:opacity-90 transition">
          <Icon name="add" className="text-base" /> Cadastrar veículo
        </button>
      }
    >
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-2xl">{toast}</div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 flex-1 min-w-64">
          <Icon name="search" className="text-sm text-gray-400" />
          <input placeholder="Buscar por modelo, marca…" className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400" />
        </div>
        {["Marca", "Status", "Score"].map((f) => (
          <button key={f} className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
            <Icon name="filter_list" className="text-sm" /> {f}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 mb-6 flex items-start gap-3">
        <Icon name="auto_awesome" className="text-blue-500 text-lg shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-blue-900">Anúncios com mais fotos tendem a converter melhor</p>
          <p className="text-xs text-blue-600">Veículos com 8+ fotos recebem em média 2,3x mais contatos.</p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {vehicles.map((v) => {
          const sl = scoreLabel(v.score);
          return (
            <div key={v.id} className="rounded-xl border border-black/10 bg-white p-5 flex flex-col shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                  <Icon name="directions_car" className="text-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <ErpStatusBadge status={v.status} />
                    <span className="text-[11px] text-gray-400">{v.daysInStock}d em estoque</span>
                  </div>
                  <h3 className="font-black text-gray-900 truncate">{v.name}</h3>
                  <p className="text-xs text-gray-400">{v.brand} · {v.year}</p>
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <p className="text-xl font-black text-gray-900">R$ {v.price.toLocaleString("pt-BR")}</p>
                <p className="text-[11px] text-gray-400">FIPE R$ {v.fipe.toLocaleString("pt-BR")}</p>
              </div>

              <div className="mt-4 rounded-lg border border-black/10 bg-gray-50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">Score de venda</p>
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${sl.cls}`}>{sl.label}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-gray-900">{v.score}</span>
                  <span className="text-xs text-gray-400">/100</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200">
                  <div className="h-full rounded-full bg-primary-container" style={{ width: `${v.score}%` }} />
                </div>
                <ul className="mt-3 space-y-1.5">
                  {v.scoreBreakdown.map((b) => (
                    <li key={b.label} className="flex items-center gap-2 text-[11px]">
                      <span className="w-24 text-gray-400">{b.label}</span>
                      <div className="h-1 flex-1 rounded-full bg-gray-200">
                        <div className="h-full rounded-full bg-yellow-400" style={{ width: `${b.value}%` }} />
                      </div>
                      <span className="w-7 text-right font-bold text-gray-700">{b.value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { icon: "visibility", val: v.views, lbl: "Views" },
                  { icon: "ads_click", val: v.clicks, lbl: "Cliques" },
                  { icon: "chat", val: v.leads, lbl: "Leads" },
                ].map((s) => (
                  <div key={s.lbl} className="rounded-md bg-gray-50 border border-black/5 py-2">
                    <Icon name={s.icon} className="text-sm text-gray-400 mx-auto block" />
                    <p className="mt-0.5 text-sm font-black text-gray-900">{s.val}</p>
                    <p className="text-[10px] text-gray-400 uppercase">{s.lbl}</p>
                  </div>
                ))}
              </div>

              {v.suggestions.length > 0 && (
                <div className="mt-4">
                  <p className="text-[11px] font-black uppercase tracking-wider text-yellow-700 mb-2">Sugestões automáticas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {v.suggestions.map((s) => {
                      const sg = suggMap[s];
                      return (
                        <button key={s} onClick={() => fire(`Ação: ${sg.label}`)} className="inline-flex items-center gap-1 rounded-md bg-primary-container px-2.5 py-1 text-[11px] font-black text-black hover:opacity-90">
                          <Icon name={sg.icon} className="text-xs" /> {sg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ErpLayout>
  );
}
