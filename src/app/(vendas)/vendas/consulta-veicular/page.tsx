"use client";
import { useState } from "react";
import ErpLayout from "@/components/erp/ErpLayout";
import Icon from "@/components/ui/Icon";

export default function ConsultaVeicularPage() {
  const [placa, setPlaca] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleConsulta(e: React.FormEvent) {
    e.preventDefault();
    if (!placa.trim()) return;
    setLoading(true);
    // Placeholder — integrate with real vehicle query API when available
    setTimeout(() => setLoading(false), 1000);
  }

  return (
    <ErpLayout title="Consulta Veicular" subtitle="Consulte dados de veículos por placa">
      <div className="max-w-xl space-y-6">
        <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm space-y-5">
          <h2 className="font-black text-gray-900 border-b border-black/5 pb-4">Consulta por placa</h2>
          <form onSubmit={handleConsulta} className="flex gap-3">
            <input
              type="text"
              value={placa}
              onChange={e => setPlaca(e.target.value.toUpperCase())}
              placeholder="AAA-0000 ou AAA0A00"
              maxLength={8}
              className="flex-1 border border-black/10 bg-white rounded-xl p-3 text-sm font-black tracking-widest focus:ring-2 focus:ring-primary-container outline-none uppercase"
            />
            <button type="submit" disabled={loading || !placa.trim()}
              className="flex items-center gap-2 bg-primary-container text-black px-6 py-3 rounded-xl font-black text-sm hover:opacity-90 transition disabled:opacity-50">
              {loading ? <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <Icon name="search" className="text-base" />}
              Consultar
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 flex items-start gap-3">
          <Icon name="info" className="text-yellow-600 text-xl shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-yellow-900 text-sm">Integração em breve</p>
            <p className="text-sm text-yellow-700 mt-1">
              A consulta veicular completa (histórico, débitos, recall, leilão) estará disponível em breve via integração com serviços especializados.
            </p>
          </div>
        </div>
      </div>
    </ErpLayout>
  );
}
