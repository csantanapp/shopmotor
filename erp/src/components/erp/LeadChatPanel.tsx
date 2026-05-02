import { useState } from "react";
import {
  X, Phone, MessageCircle, FileSignature, Send, Car, Globe, Wallet,
  ShieldCheck, Flame, Clock, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type ChatLead = {
  name: string;
  phone: string;
  car: string;
  origin: "site" | "financiamento" | "seguro";
  temp: "quente" | "morno" | "frio";
  probability: number;
  lastContact: string;
};

type Msg = { id: number; from: "lead" | "loja"; text: string; time: string };

const initial: Msg[] = [
  { id: 1, from: "lead", text: "Oi, esse carro ainda está disponível?", time: "10:42" },
  { id: 2, from: "loja", text: "Olá! Sim, está disponível e em ótimo estado. Quer agendar uma visita?", time: "10:43" },
  { id: 3, from: "lead", text: "Aceita financiamento?", time: "10:58" },
];

const quickReplies = [
  "Ainda disponível",
  "Aceita financiamento",
  "Pode visitar?",
  "Aceita troca",
  "Quitado",
];

const replyText: Record<string, string> = {
  "Ainda disponível": "Sim, está disponível! Posso te enviar mais fotos agora?",
  "Aceita financiamento": "Aceitamos sim. Posso simular as parcelas em até 60x?",
  "Pode visitar?": "Claro! Estamos abertos seg-sáb das 9h às 19h. Que horário fica bom?",
  "Aceita troca": "Aceitamos sim. Pode me enviar marca, modelo e ano do seu carro?",
  "Quitado": "Sim, está totalmente quitado e com documentação em dia.",
};

export function LeadChatPanel({ lead, onClose }: { lead: ChatLead | null; onClose: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>(initial);
  const [text, setText] = useState("");

  if (!lead) return null;

  const send = (content?: string) => {
    const value = (content ?? text).trim();
    if (!value) return;
    setMsgs((m) => [...m, { id: Date.now(), from: "loja", text: value, time: "agora" }]);
    setText("");
  };

  const tempStyle: Record<ChatLead["temp"], string> = {
    quente: "bg-destructive/10 text-destructive border-destructive/30",
    morno: "bg-gold/15 text-gold-deep border-gold/40",
    frio: "bg-info/10 text-info border-info/30",
  };

  const OriginIcon = lead.origin === "site" ? Globe : lead.origin === "financiamento" ? Wallet : ShieldCheck;

  return (
    <div className="fixed inset-0 z-50 flex bg-ink/60 backdrop-blur-sm">
      <div className="ml-auto flex h-full w-full max-w-4xl bg-background shadow-elegant animate-in slide-in-from-right">
        {/* Sidebar - lead info */}
        <aside className="hidden md:flex w-72 flex-col border-r border-border bg-muted/30">
          <div className="border-b border-border bg-gradient-dark p-5 text-background">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gold">Atendimento</p>
            <h3 className="mt-1 text-lg font-bold">{lead.name}</h3>
            <p className="text-xs text-background/60">{lead.phone}</p>

            <div className="mt-3 flex items-center gap-2">
              <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase", tempStyle[lead.temp])}>
                <Flame className="h-2.5 w-2.5" /> {lead.temp}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-background/20 bg-background/10 px-2 py-0.5 text-[10px] text-background/80">
                <OriginIcon className="h-2.5 w-2.5" /> {lead.origin}
              </span>
            </div>
          </div>

          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Veículo de interesse</p>
              <div className="rounded-lg border border-border bg-card p-3 flex gap-2 items-start">
                <Car className="h-5 w-5 text-gold-deep shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{lead.car}</p>
                  <p className="text-[11px] text-muted-foreground">Anúncio ativo</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Probabilidade</p>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">{lead.probability}%</span>
                <span className="text-[10px] text-muted-foreground">{lead.lastContact}</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-background">
                <div className="h-full rounded-full bg-gradient-gold" style={{ width: `${lead.probability}%` }} />
              </div>
            </div>

            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold">Responda rápido</p>
                  <p className="text-[11px] text-muted-foreground">Leads respondidos em 5 min têm 4x mais chance de fechar.</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Histórico</p>
              <ul className="space-y-2 text-[11px] text-muted-foreground">
                <li className="flex gap-2"><Zap className="h-3 w-3 text-gold mt-0.5" /> Visitou anúncio 3x</li>
                <li className="flex gap-2"><Zap className="h-3 w-3 text-gold mt-0.5" /> Simulou financiamento</li>
                <li className="flex gap-2"><Zap className="h-3 w-3 text-gold mt-0.5" /> Salvou veículo nos favoritos</li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Chat */}
        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-border bg-card px-5 py-3">
            <div className="flex items-center gap-2">
              <button onClick={() => toast("Iniciando ligação…")} className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90">
                <Phone className="h-3.5 w-3.5" /> Ligar
              </button>
              <button onClick={() => toast.success(`WhatsApp aberto: ${lead.name}`)} className="inline-flex items-center gap-1.5 rounded-lg bg-success px-3 py-1.5 text-xs font-semibold text-success-foreground hover:opacity-90">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </button>
              <button onClick={() => toast.success("Proposta enviada")} className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-gold px-3 py-1.5 text-xs font-bold text-ink shadow-gold hover:opacity-90">
                <FileSignature className="h-3.5 w-3.5" /> Enviar proposta
              </button>
            </div>
            <button onClick={onClose} className="rounded-lg p-2 hover:bg-accent">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-muted/20 p-5 space-y-3">
            {msgs.map((m) => (
              <div key={m.id} className={cn("flex", m.from === "loja" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                  m.from === "loja"
                    ? "bg-gradient-gold text-ink rounded-br-sm"
                    : "bg-card border border-border rounded-bl-sm",
                )}>
                  <p>{m.text}</p>
                  <p className={cn("mt-1 text-[10px]", m.from === "loja" ? "text-ink/60" : "text-muted-foreground")}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border bg-card p-3">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {quickReplies.map((q) => (
                <button
                  key={q}
                  onClick={() => send(replyText[q])}
                  className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium hover:border-gold hover:bg-gold/5"
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Digite uma mensagem…"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
              <button onClick={() => send()} className="rounded-lg bg-ink p-2.5 text-background hover:opacity-90">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}