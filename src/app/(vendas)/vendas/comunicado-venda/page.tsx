"use client";
import { useState, useEffect } from "react";
import ErpLayout from "@/components/erp/ErpLayout";
import Icon from "@/components/ui/Icon";

interface Vehicle {
  id: string; brand: string; model: string; version?: string;
  yearFab: number; price: number; photos: { url: string }[];
}

export default function ComunicadoVendaPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [form, setForm] = useState({ comprador: "", cpfCnpj: "", data: "", valor: "", observacoes: "" });
  const [loading, setLoading] = useState(true);
  const [printed, setPrinted] = useState(false);

  useEffect(() => {
    fetch("/api/vehicles/mine").then(r => r.json()).then(d => {
      setVehicles(d.vehicles ?? []);
      setLoading(false);
    });
  }, []);

  const vehicle = vehicles.find(v => v.id === selected);

  function handlePrint() {
    setPrinted(true);
    setTimeout(() => window.print(), 200);
  }

  return (
    <ErpLayout title="Comunicado de Venda" subtitle="Gere o documento de comunicado de venda do veículo">
      <div className="max-w-2xl space-y-5">
        <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm space-y-5">
          <h2 className="font-black text-gray-900 border-b border-black/5 pb-4">Dados do comunicado</h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">Veículo *</label>
            <select value={selected} onChange={e => setSelected(e.target.value)}
              className="w-full border border-black/10 bg-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none">
              <option value="">Selecione o veículo</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} {v.version} {v.yearFab}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { field: "comprador", label: "Nome do comprador *", placeholder: "Nome completo" },
              { field: "cpfCnpj",   label: "CPF / CNPJ *",        placeholder: "000.000.000-00" },
              { field: "data",      label: "Data da venda *",      placeholder: "", type: "date" },
              { field: "valor",     label: "Valor da venda (R$) *", placeholder: "0" },
            ].map(({ field, label, placeholder, type }) => (
              <div key={field} className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">{label}</label>
                <input type={type ?? "text"} value={form[field as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full border border-black/10 bg-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none" />
              </div>
            ))}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-gray-400">Observações</label>
              <textarea rows={3} value={form.observacoes}
                onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
                className="w-full border border-black/10 bg-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-container outline-none resize-none"
                placeholder="Informações adicionais..." />
            </div>
          </div>
        </div>

        {/* Preview */}
        {vehicle && form.comprador && form.data && (
          <div id="comunicado-print" className="rounded-xl border border-black/10 bg-white p-8 shadow-sm space-y-4 print:shadow-none print:border-none">
            <div className="flex items-center justify-between border-b border-black/10 pb-4">
              <div>
                <p className="text-xl font-black text-gray-900">Comunicado de Venda</p>
                <p className="text-xs text-gray-400 mt-0.5">ShopMotor — Sistema de Gestão</p>
              </div>
              <p className="text-xs text-gray-400">{new Date().toLocaleDateString("pt-BR")}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-gray-400 uppercase font-black">Veículo</p><p className="font-bold text-gray-900">{vehicle.brand} {vehicle.model} {vehicle.yearFab}</p></div>
              <div><p className="text-xs text-gray-400 uppercase font-black">Comprador</p><p className="font-bold text-gray-900">{form.comprador}</p></div>
              <div><p className="text-xs text-gray-400 uppercase font-black">CPF / CNPJ</p><p className="font-bold text-gray-900">{form.cpfCnpj}</p></div>
              <div><p className="text-xs text-gray-400 uppercase font-black">Data</p><p className="font-bold text-gray-900">{new Date(form.data + "T12:00").toLocaleDateString("pt-BR")}</p></div>
              {form.valor && <div><p className="text-xs text-gray-400 uppercase font-black">Valor</p><p className="font-bold text-gray-900">R$ {form.valor}</p></div>}
              {form.observacoes && <div className="col-span-2"><p className="text-xs text-gray-400 uppercase font-black">Observações</p><p className="text-gray-700">{form.observacoes}</p></div>}
            </div>
            <div className="mt-6 pt-4 border-t border-black/10 flex justify-between text-xs text-gray-400">
              <p>Assinatura do vendedor: ______________________________</p>
              <p>Assinatura do comprador: ______________________________</p>
            </div>
          </div>
        )}

        {vehicle && form.comprador && form.data && (
          <button onClick={handlePrint}
            className="flex items-center gap-2 bg-primary-container text-black px-8 py-3 rounded-xl font-black text-sm hover:opacity-90 transition">
            <Icon name="print" className="text-base" /> Imprimir / Salvar PDF
          </button>
        )}
      </div>
    </ErpLayout>
  );
}
