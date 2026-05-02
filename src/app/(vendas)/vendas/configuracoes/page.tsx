"use client";

import { useState } from "react";
import ErpLayout from "@/components/erp/ErpLayout";
import Icon from "@/components/ui/Icon";

const fields = [
  ["Razão social", "AutoPrime Veículos LTDA"],
  ["CNPJ", "12.345.678/0001-90"],
  ["E-mail", "contato@autoprime.com.br"],
  ["Telefone", "(11) 4002-8922"],
  ["Cidade", "São Paulo, SP"],
  ["Responsável", "Carlos Mendes"],
] as const;

const planFeatures = ["Anúncios ilimitados", "BI avançado", "CRM completo", "Suporte prioritário"];

export default function ConfiguracoesPage() {
  const [toast, setToast] = useState("");
  const fire = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  return (
    <ErpLayout title="Perfil / Configurações" subtitle="Dados do lojista, plano e integrações">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#1a1a1a] border border-white/10 px-4 py-3 text-sm text-white shadow-2xl">{toast}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-[#1a1a1a] p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-container text-black shadow-lg shadow-primary-container/30">
              <Icon name="store" className="text-2xl" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">AutoPrime Motors</h2>
              <p className="text-sm text-white/50">Lojista verificado · São Paulo, SP</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {fields.map(([label, value]) => (
              <div key={label}>
                <p className="text-xs uppercase tracking-wider text-white/40 font-black">{label}</p>
                <input
                  defaultValue={value}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-primary-container/50 transition"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button className="rounded-xl border border-white/10 px-4 py-2 text-sm font-black text-white hover:bg-white/10 transition">
              Cancelar
            </button>
            <button onClick={() => fire("Alterações salvas")} className="rounded-xl bg-primary-container px-4 py-2 text-sm font-black text-black hover:opacity-90 transition">
              Salvar alterações
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-primary-container/40 bg-[#1a1500] p-6">
            <div className="flex items-center gap-2 text-primary-container mb-3">
              <Icon name="workspace_premium" className="text-base" />
              <span className="text-xs font-black uppercase tracking-wider">Plano Pro</span>
            </div>
            <p className="text-2xl font-black text-white">R$ 499<span className="text-sm font-normal text-white/50">/mês</span></p>
            <ul className="mt-4 space-y-2">
              {planFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                  <Icon name="check" className="text-primary-container text-sm" /> {f}
                </li>
              ))}
            </ul>
            <button onClick={() => fire("Fale com vendas para upgrade")} className="mt-5 w-full rounded-xl bg-primary-container py-2 text-sm font-black text-black hover:opacity-90 transition">
              Fazer upgrade para Elite
            </button>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-6">
            <h3 className="font-black text-white flex items-center gap-2 mb-4">
              <Icon name="cable" className="text-base text-white/50" /> Integrações
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-white/80">
                  <Icon name="chat" className="text-green-400 text-sm" /> WhatsApp Business
                </span>
                <span className="rounded-full bg-green-500/15 text-green-400 px-2 py-0.5 text-[11px] font-black">Conectado</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-white/60">Mercado Pago</span>
                <button onClick={() => fire("Conectando Mercado Pago…")} className="text-xs font-black text-primary-container hover:underline">Conectar</button>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-white/60">Webmotors API</span>
                <button onClick={() => fire("Conectando Webmotors…")} className="text-xs font-black text-primary-container hover:underline">Conectar</button>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-white/60">iCarros API</span>
                <button onClick={() => fire("Conectando iCarros…")} className="text-xs font-black text-primary-container hover:underline">Conectar</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </ErpLayout>
  );
}
