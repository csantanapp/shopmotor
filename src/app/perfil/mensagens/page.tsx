"use client";

import { useState } from "react";
import Image from "next/image";
import Icon from "@/components/ui/Icon";

const conversations = [
  {
    id: 1,
    name: "Carlos Mendes",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB8MctoC3_yr1sIy4oQnQjN2hUH5ym3YHFIJZbjJ0NpxTxjojNjzAlCnwU8bKfBtihNKvC3qdY4b9iOv0_tp13b78AcRFjYWf12Nv75wxd2e_sorGTZTmArEl-pW11ne4wlrtpF5dVWd4oIE9jAU1VN99Vf4VTwe8jxGJVOMtNXtIaremJLgf8iGmfVo-ssutzUOXSiwJ1ipVYk8VdL6JHjOZ7AUGZREGSIKY9kbig6bsq-0PsX1AYamBl74iiSK5V-f-AlM-zRBTo",
    car: "Porsche Taycan Turbo S",
    lastMessage: "Posso visitar o carro amanhã às 10h?",
    time: "10:42",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Ana Paula Lima",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCicR0o1OoMNSfiloBULRm43rCrNwg8xBuJtfZFCRUS_QJE1TEpFG_LVitFOm6Ms4T2zH86euZh_7KK-QVCJwam6tM0kl_FqSC4wdFcAcdd5TYDI4ankfBjTpvmb_O9lt-WJsqaITR2FTbEpTe9vuxd1f9GKp9RdqGPsjncoud1No3-_OLjHAELky3N7D2hEB5eDMwpQnXyFg6MoN-NzCVeQNuAP44nLSA68DSUoHdfetMiJTfh_wOOHI0RWiBLtG3Ug0v3e04MrJ8",
    car: "Porsche Taycan Turbo S",
    lastMessage: "Qual a revisão mais recente?",
    time: "Ontem",
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: "Roberto Souza",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB8MctoC3_yr1sIy4oQnQjN2hUH5ym3YHFIJZbjJ0NpxTxjojNjzAlCnwU8bKfBtihNKvC3qdY4b9iOv0_tp13b78AcRFjYWf12Nv75wxd2e_sorGTZTmArEl-pW11ne4wlrtpF5dVWd4oIE9jAU1VN99Vf4VTwe8jxGJVOMtNXtIaremJLgf8iGmfVo-ssutzUOXSiwJ1ipVYk8VdL6JHjOZ7AUGZREGSIKY9kbig6bsq-0PsX1AYamBl74iiSK5V-f-AlM-zRBTo",
    car: "Porsche Taycan Turbo S",
    lastMessage: "Aceita proposta de R$ 1.100.000?",
    time: "Seg",
    unread: 0,
    online: false,
  },
];

const mockMessages = [
  { id: 1, from: "them", text: "Olá! Tenho interesse no Porsche Taycan. Ainda está disponível?", time: "10:30" },
  { id: 2, from: "me", text: "Sim, está disponível! Veículo em perfeito estado, único dono.", time: "10:35" },
  { id: 3, from: "them", text: "Ótimo! Posso visitar o carro amanhã às 10h?", time: "10:42" },
];

export default function MensagensPage() {
  const [active, setActive] = useState(conversations[0]);
  const [input, setInput] = useState("");

  return (
    <div className="h-[calc(100vh-80px-64px)] flex gap-0 rounded-2xl overflow-hidden shadow-sm border border-outline-variant/30">

      {/* Lista de conversas */}
      <div className="w-72 flex-shrink-0 bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col">
        <div className="p-4 border-b border-outline-variant/20">
          <h2 className="font-black text-lg uppercase tracking-tight text-on-surface">Mensagens</h2>
          <div className="relative mt-3">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg" />
            <input
              placeholder="Buscar conversa..."
              className="w-full pl-10 pr-4 py-2 bg-surface-container rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-container outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActive(conv)}
              className={`w-full flex items-start gap-3 px-4 py-4 text-left transition-colors border-b border-outline-variant/10 ${
                active.id === conv.id ? "bg-primary-container/15" : "hover:bg-surface-container"
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden relative">
                  <Image src={conv.avatar} alt={conv.name} fill className="object-cover" />
                </div>
                {conv.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-on-surface truncate">{conv.name}</span>
                  <span className="text-[10px] text-outline ml-2 flex-shrink-0">{conv.time}</span>
                </div>
                <p className="text-[10px] text-primary font-semibold truncate">{conv.car}</p>
                <p className="text-xs text-on-surface-variant truncate mt-0.5">{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && (
                <span className="w-5 h-5 bg-primary-container rounded-full text-[10px] font-black text-on-primary-container flex items-center justify-center flex-shrink-0 mt-1">
                  {conv.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col bg-surface">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/20 bg-surface-container-lowest flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden relative">
              <Image src={active.avatar} alt={active.name} fill className="object-cover" />
            </div>
            <div>
              <p className="font-bold text-sm text-on-surface">{active.name}</p>
              <p className="text-[10px] text-primary font-semibold">{active.car}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
              <Icon name="phone" className="text-lg" />
            </button>
            <button className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
              <Icon name="more_vert" className="text-lg" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {mockMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm ${
                msg.from === "me"
                  ? "bg-primary-container text-on-primary-container rounded-br-sm"
                  : "bg-surface-container-lowest text-on-surface shadow-sm rounded-bl-sm"
              }`}>
                <p>{msg.text}</p>
                <p className={`text-[10px] mt-1 text-right ${msg.from === "me" ? "text-on-primary-container/60" : "text-outline"}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-lowest">
          <div className="flex items-center gap-3">
            <button className="p-2 text-outline hover:text-on-surface transition-colors flex-shrink-0">
              <Icon name="attach_file" className="text-xl" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-surface-container rounded-full px-5 py-3 text-sm border-0 focus:ring-2 focus:ring-primary-container outline-none"
            />
            <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
              input.trim() ? "bg-primary-container text-on-primary-container" : "bg-surface-container text-outline"
            }`}>
              <Icon name="send" className="text-lg" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
