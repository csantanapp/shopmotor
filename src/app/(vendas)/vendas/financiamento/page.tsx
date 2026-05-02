"use client";

import { useState } from "react";
import ErpLayout from "@/components/erp/ErpLayout";
import ErpKpiCard from "@/components/erp/ErpKpiCard";
import ErpStatusBadge from "@/components/erp/ErpStatusBadge";
import Icon from "@/components/ui/Icon";

const rows = [
  { name: "Rafael Souza", car: "Toyota Corolla 2023", value: 142900, down: 30000, term: 60, parcel: 2980, status: "novo", chance: 82 },
  { name: "Marcos Lima", car: "Jeep Compass Limited", value: 198500, down: 50000, term: 60, parcel: 4120, status: "analise", chance: 78 },
  { name: "Larissa Mota", car: "Jeep Renegade Sport", value: 119000, down: 25000, term: 48, parcel: 2480, status: "aprovado", chance: 91 },
  { name: "Bruno Costa", car: "VW Nivus Highline", value: 132500, down: 28000, term: 60, parcel: 2750, status: "analise", chance: 64 },
  { name: "Camila Faria", car: "Honda Fit EXL", value: 89900, down: 15000, term: 60, parcel: 1880, status: "reprovado", chance: 18 },
  { name: "Ana Beatriz", car: "VW T-Cross", value: 138900, down: 35000, term: 48, parcel: 2890, status: "aprovado", chance: 88 },
];

const chanceCls = (c: number) =>
  c >= 75 ? "bg-green-500/15 text-green-400" : c >= 50 ? "bg-primary-container/15 text-primary-container" : "bg-red-500/15 text-red-400";

export default function FinanciamentoPage() {
  const [toast, setToast] = useState("");
  const fire = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  return (
    <ErpLayout title="Financiamento" subtitle="Leads de financiamento são oportunidades de alta intenção">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#1a1a1a] border border-white/10 px-4 py-3 text-sm text-white shadow-2xl">{toast}</div>
      )}

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <ErpKpiCard label="Novos" value="12" icon="account_balance" />
        <ErpKpiCard label="Em análise" value="28" icon="hourglass_empty" />
        <ErpKpiCard label="Aprovados" value="41" delta={14} deltaLabel="este mês" icon="check_circle" accent />
        <ErpKpiCard label="Reprovados" value="9" icon="cancel" />
      </div>

      <div className="mb-6 rounded-xl border border-primary-container/30 bg-primary-container/5 p-4 flex items-start gap-3">
        <Icon name="local_fire_department" className="text-primary-container text-lg shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-black text-white">Cliente que simula financiamento tem 3x mais chance de fechar</p>
          <p className="text-xs text-white/50">Priorize esses leads e envie a proposta em até 1 hora.</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#1a1a1a]">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-white/40">
            <tr>
              {["Cliente", "Veículo", "Valor", "Entrada / Prazo", "Parcela", "Chance", "Status", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-black">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r) => (
              <tr key={r.name} className="hover:bg-white/5 transition">
                <td className="px-4 py-4 font-black text-white">{r.name}</td>
                <td className="px-4 py-4 text-white/60">{r.car}</td>
                <td className="px-4 py-4 font-black text-white">R$ {r.value.toLocaleString("pt-BR")}</td>
                <td className="px-4 py-4 text-xs text-white/60">R$ {r.down.toLocaleString("pt-BR")} · {r.term}x</td>
                <td className="px-4 py-4 text-white">R$ {r.parcel.toLocaleString("pt-BR")}</td>
                <td className="px-4 py-4">
                  <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-black ${chanceCls(r.chance)}`}>{r.chance}%</span>
                </td>
                <td className="px-4 py-4"><ErpStatusBadge status={r.status} /></td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => fire(`Proposta enviada a ${r.name}`)} className="rounded-md bg-primary-container p-1.5 text-black hover:opacity-90" title="Enviar proposta">
                      <Icon name="description" className="text-sm" />
                    </button>
                    <button onClick={() => fire(`WhatsApp: ${r.name}`)} className="rounded-md bg-green-500 p-1.5 text-white hover:opacity-90" title="WhatsApp">
                      <Icon name="chat" className="text-sm" />
                    </button>
                    <button onClick={() => fire("Encaminhado ao parceiro")} className="rounded-md border border-white/10 p-1.5 hover:bg-white/10 text-white/60" title="Parceiro">
                      <Icon name="share" className="text-sm" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ErpLayout>
  );
}
