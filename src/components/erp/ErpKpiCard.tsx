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
    <div className={`rounded-xl border p-5 flex flex-col gap-3 bg-white ${accent ? "border-primary-container/40" : "border-black/10"}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent ? "bg-primary-container text-black" : "bg-gray-100 text-gray-500"}`}>
          <Icon name={icon} className="text-base" />
        </div>
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      {delta !== undefined && (
        <p className={`text-xs font-semibold ${up ? "text-green-600" : "text-red-500"}`}>
          {up ? "+" : ""}{delta}% {deltaLabel}
        </p>
      )}
    </div>
  );
}
