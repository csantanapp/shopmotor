const map: Record<string, { label: string; cls: string }> = {
  novo:         { label: "Novo",         cls: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  ativo:        { label: "Ativo",        cls: "bg-green-500/15 text-green-400 border-green-500/30" },
  vendido:      { label: "Vendido",      cls: "bg-primary-container/20 text-primary-container border-primary-container/40" },
  pausado:      { label: "Pausado",      cls: "bg-white/10 text-white/50 border-white/20" },
  analise:      { label: "Em análise",   cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  aprovado:     { label: "Aprovado",     cls: "bg-green-500/15 text-green-400 border-green-500/30" },
  reprovado:    { label: "Reprovado",    cls: "bg-red-500/15 text-red-400 border-red-500/30" },
  fechado:      { label: "Fechado",      cls: "bg-primary-container/20 text-primary-container border-primary-container/40" },
  atendimento:  { label: "Atendimento",  cls: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  proposta:     { label: "Proposta",     cls: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  turbo:        { label: "Turbo",        cls: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  destaque:     { label: "Destaque",     cls: "bg-primary-container/20 text-primary-container border-primary-container/40" },
  super:        { label: "Super",        cls: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  normal:       { label: "Normal",       cls: "bg-white/10 text-white/50 border-white/20" },
};

export default function ErpStatusBadge({ status, label }: { status: string; label?: string }) {
  const s = map[status] ?? { label: status, cls: "bg-white/10 text-white/50 border-white/20" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${s.cls}`}>
      {label ?? s.label}
    </span>
  );
}
