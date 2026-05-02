"use client";

import { useState } from "react";
import ErpLayout from "@/components/erp/ErpLayout";
import ErpKpiCard from "@/components/erp/ErpKpiCard";
import ErpStatusBadge from "@/components/erp/ErpStatusBadge";
import Icon from "@/components/ui/Icon";

const rows = [
  { name: "Bruno Costa", car: "VW Nivus Highline", city: "São Paulo, SP", use: "Particular", broker: "Porto Seguro", revenue: 480, status: "novo" },
  { name: "Juliana Pires", car: "Honda Civic Touring", city: "São Paulo, SP", use: "Particular", broker: "SulAmérica", revenue: 620, status: "atendimento" },
  { name: "Pedro Alves", car: "Honda CB 500F", city: "Rio de Janeiro, RJ", use: "Particular", broker: "Mapfre", revenue: 240, status: "proposta" },
  { name: "Marcos Lima", car: "Jeep Compass", city: "Belo Horizonte, MG", use: "Particular", broker: "Porto Seguro", revenue: 890, status: "fechado" },
  { name: "Larissa Mota", car: "Yamaha Fazer 250", city: "Curitiba, PR", use: "Trabalho", broker: "Mapfre", revenue: 320, status: "atendimento" },
];

export default function SegurosPage() {
  const [toast, setToast] = useState("");
  const fire = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  return (
    <ErpLayout title="Seguro" subtitle="Leads de cotação — receita extra por cada venda">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-2xl">{toast}</div>
      )}

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <ErpKpiCard label="Leads no mês" value="156" delta={11} deltaLabel="vs. mês anterior" icon="shield" accent />
        <ErpKpiCard label="Em atendimento" value="34" icon="hourglass_empty" />
        <ErpKpiCard label="Fechados" value="22" delta={6} deltaLabel="conversão 14%" icon="check_circle" />
        <ErpKpiCard label="Veículos cobertos" value="98" icon="directions_car" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-black/10 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400 border-b border-black/10">
            <tr>
              {["Cliente", "Veículo", "Cidade", "Uso", "Parceiro", "Potencial", "Status", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-black">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {rows.map((r) => (
              <tr key={r.name} className="hover:bg-gray-50 transition">
                <td className="px-4 py-4 font-black text-gray-900">{r.name}</td>
                <td className="px-4 py-4 text-gray-500">{r.car}</td>
                <td className="px-4 py-4 text-xs text-gray-500">{r.city}</td>
                <td className="px-4 py-4 text-xs text-gray-500">{r.use}</td>
                <td className="px-4 py-4 text-xs text-gray-500">{r.broker}</td>
                <td className="px-4 py-4 font-black text-green-600">R$ {r.revenue}</td>
                <td className="px-4 py-4"><ErpStatusBadge status={r.status} /></td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => fire("Enviado para corretora")} className="rounded-md bg-primary-container p-1.5 text-black hover:opacity-90" title="Corretora">
                      <Icon name="send" className="text-sm" />
                    </button>
                    <button onClick={() => fire("Iniciando ligação…")} className="rounded-md bg-gray-900 p-1.5 text-white hover:opacity-90" title="Ligar">
                      <Icon name="phone" className="text-sm" />
                    </button>
                    <button className="rounded-md border border-black/10 p-1.5 hover:bg-gray-100 text-gray-500" title="Detalhes">
                      <Icon name="visibility" className="text-sm" />
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
