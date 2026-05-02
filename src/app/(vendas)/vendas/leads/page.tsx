"use client";

import { useState } from "react";
import ErpLayout from "@/components/erp/ErpLayout";
import Icon from "@/components/ui/Icon";

type Temp = "quente" | "morno" | "frio";
type Lead = {
  name: string; phone: string; car: string;
  origin: "site" | "financiamento" | "seguro";
  temp: Temp; lastContact: string; probability: number; alert?: string;
};
type Col = { key: string; title: string; dotCls: string; leads: Lead[] };

const columns: Col[] = [
  { key: "novo", title: "Novo lead", dotCls: "bg-blue-400", leads: [
    { name: "Rafael Souza", phone: "(11) 9 8800-1122", car: "Toyota Corolla 2023", origin: "site", temp: "quente", lastContact: "há 18 min", probability: 78, alert: "Lead ativo agora no site" },
    { name: "Pedro Alves", phone: "(21) 9 9911-3344", car: "Honda CB 500F", origin: "site", temp: "morno", lastContact: "há 2h", probability: 52 },
    { name: "Larissa Mota", phone: "(31) 9 9001-2233", car: "Jeep Renegade", origin: "financiamento", temp: "quente", lastContact: "há 35 min", probability: 71, alert: "Simulou financiamento" },
  ]},
  { key: "atendimento", title: "Em atendimento", dotCls: "bg-orange-400", leads: [
    { name: "Juliana Pires", phone: "(11) 9 7766-5544", car: "Honda Civic Touring", origin: "site", temp: "quente", lastContact: "há 12 min", probability: 82, alert: "Abriu o anúncio novamente" },
    { name: "Bruno Costa", phone: "(41) 9 8123-4455", car: "VW Nivus", origin: "seguro", temp: "morno", lastContact: "há 4h", probability: 48 },
  ]},
  { key: "proposta", title: "Proposta enviada", dotCls: "bg-purple-400", leads: [
    { name: "Marcos Lima", phone: "(11) 9 6543-2211", car: "Jeep Compass Limited", origin: "financiamento", temp: "quente", lastContact: "há 42 min", probability: 88, alert: "Responder em até 3 minutos" },
  ]},
  { key: "negociacao", title: "Negociação", dotCls: "bg-primary-container", leads: [
    { name: "Ana Beatriz", phone: "(11) 9 4321-1100", car: "VW T-Cross Highline", origin: "site", temp: "quente", lastContact: "há 1h", probability: 91, alert: "Alta intenção de compra" },
    { name: "Fábio Reis", phone: "(11) 9 8765-4321", car: "Hyundai HB20", origin: "site", temp: "morno", lastContact: "há 1 dia", probability: 55 },
  ]},
  { key: "fechado", title: "Fechado / Perdido", dotCls: "bg-green-400", leads: [
    { name: "Camila Faria", phone: "(11) 9 1122-3344", car: "Honda Fit", origin: "site", temp: "frio", lastContact: "há 5 dias", probability: 100 },
  ]},
];

const tempStyle: Record<Temp, string> = {
  quente: "bg-red-500/15 text-red-400 border-red-500/30",
  morno: "bg-primary-container/15 text-primary-container border-primary-container/30",
  frio: "bg-blue-500/10 text-blue-400 border-blue-500/30",
};
const tempIcon: Record<Temp, string> = { quente: "local_fire_department", morno: "device_thermostat", frio: "ac_unit" };
const originIcon: Record<string, string> = { site: "language", financiamento: "account_balance", seguro: "shield" };

export default function LeadsPage() {
  const [active, setActive] = useState<Lead | null>(null);
  const [toast, setToast] = useState("");
  const fire = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const sorted = columns.map((c) => ({ ...c, leads: [...c.leads].sort((a, b) => b.probability - a.probability) }));

  return (
    <ErpLayout
      title="CRM de Alta Pressão"
      subtitle="Responda primeiro os leads com maior chance de compra"
      action={
        <button onClick={() => fire("Novo lead criado")} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-white hover:bg-white/10 transition">
          <Icon name="add" className="text-base" /> Novo lead
        </button>
      }
    >
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#1a1a1a] border border-white/10 px-4 py-3 text-sm text-white shadow-2xl">{toast}</div>
      )}

      {/* Lead Chat Panel */}
      {active && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#111] border-l border-white/10 flex flex-col shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div>
              <p className="font-black text-white">{active.name}</p>
              <p className="text-xs text-white/50">{active.car}</p>
            </div>
            <button onClick={() => setActive(null)} className="rounded-lg border border-white/10 p-2 hover:bg-white/10 transition">
              <Icon name="close" className="text-white text-base" />
            </button>
          </div>
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            <div className="flex justify-end"><div className="rounded-xl rounded-tr-none bg-primary-container text-black text-sm px-3 py-2 max-w-xs">Olá! Gostaria de saber mais sobre o {active.car}.</div></div>
            <div className="flex"><div className="rounded-xl rounded-tl-none bg-white/10 text-white text-sm px-3 py-2 max-w-xs">Olá! Temos esse veículo disponível. Como posso ajudar?</div></div>
            <div className="flex justify-end"><div className="rounded-xl rounded-tr-none bg-primary-container text-black text-sm px-3 py-2 max-w-xs">Qual o valor final? Tem condições de financiamento?</div></div>
          </div>
          <div className="p-4 border-t border-white/10 flex gap-2">
            <input placeholder="Escreva uma mensagem…" className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30" />
            <button onClick={() => fire("Mensagem enviada")} className="rounded-xl bg-primary-container p-2 text-black hover:opacity-90">
              <Icon name="send" className="text-base" />
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 mb-6 flex items-start gap-3">
        <Icon name="local_fire_department" className="text-red-400 text-lg shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-black text-white">Tempo de resposta é um dos maiores fatores de conversão</p>
          <p className="text-xs text-white/50">Você tem <span className="font-black text-red-400">3 leads quentes</span> esperando há mais de 15 minutos.</p>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {sorted.map((col) => (
          <div key={col.key} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${col.dotCls}`} />
                <h3 className="text-sm font-black text-white">{col.title}</h3>
              </div>
              <span className="text-xs font-bold text-white/40">{col.leads.length}</span>
            </div>
            <div className="space-y-2.5">
              {col.leads.map((l) => (
                <div key={l.name} onClick={() => setActive(l)} className="cursor-pointer rounded-xl border border-white/10 bg-[#1a1a1a] p-3 hover:border-primary-container/40 transition">
                  {l.alert && (
                    <div className="mb-2 flex items-center gap-1.5 rounded-md bg-red-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-red-400">
                      <Icon name="visibility" className="text-xs" /> {l.alert}
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-white truncate">{l.name}</p>
                      <p className="text-xs text-white/40 truncate">{l.car}</p>
                    </div>
                    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-black uppercase ${tempStyle[l.temp]}`}>
                      <Icon name={tempIcon[l.temp]} className="text-[10px]" /> {l.temp}
                    </span>
                  </div>
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between text-[10px] mb-0.5">
                      <span className="text-white/40">Probabilidade</span>
                      <span className="font-black text-white">{l.probability}%</span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-primary-container" style={{ width: `${l.probability}%` }} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[10px] text-white/40">
                      <Icon name={originIcon[l.origin]} className="text-[10px]" /> {l.origin}
                    </span>
                    <span className="text-[10px] text-white/40">{l.lastContact}</span>
                  </div>
                  <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                    <button onClick={(e) => { e.stopPropagation(); fire("Iniciando ligação…"); }} className="flex items-center justify-center gap-1 rounded-md bg-white/10 py-1.5 text-[10px] font-black text-white hover:bg-white/20">
                      <Icon name="phone" className="text-[10px]" /> Ligar
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); fire(`WhatsApp: ${l.name}`); }} className="flex items-center justify-center gap-1 rounded-md bg-green-500 py-1.5 text-[10px] font-black text-white hover:opacity-90">
                      <Icon name="chat" className="text-[10px]" /> Wpp
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); fire("Lead movido"); }} className="flex items-center justify-center gap-1 rounded-md border border-white/10 py-1.5 text-[10px] font-black text-white hover:bg-white/5">
                      Mover <Icon name="chevron_right" className="text-[10px]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ErpLayout>
  );
}
