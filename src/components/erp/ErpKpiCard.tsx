"use client";

import Icon from "@/components/ui/Icon";

export default function ErpKpiCard({
  label,
  value,
  delta,
  deltaLabel,
  icon,
  accent,
}: {
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  icon: string;
  accent?: boolean;
}) {
  const up = delta !== undefined && delta >= 0;
  return (
    <div className={`rounded-xl border p-5 flex flex-col gap-3 ${accent ? "border-primary-container/30 bg-primary-container/10" : "border-white/10 bg-[#1a1a1a]"}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-white/40">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent ? "bg-primary-container text-black" : "bg-white/10 text-white/60"}`}>
          <Icon name={icon} className="text-base" />
        </div>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      {delta !== undefined && (
        <p className={`text-xs font-semibold ${up ? "text-green-400" : "text-red-400"}`}>
          {up ? "+" : ""}{delta}% {deltaLabel}
        </p>
      )}
    </div>
  );
}
