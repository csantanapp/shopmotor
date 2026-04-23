"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

interface Ad {
  id: string; active: boolean;
  title?: string; subtitle?: string; imageUrl?: string;
  linkUrl?: string; linkLabel?: string;
}

export default function AdCard({ slot }: { slot: string }) {
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    fetch(`/api/ads?slot=${slot}`)
      .then(r => r.json())
      .then((ads: Ad[]) => setAd(ads[0] ?? null));
  }, [slot]);

  if (!ad) return null;

  return (
    <Link
      href={ad.linkUrl ?? "#"}
      target={ad.linkUrl ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm block relative group border border-primary-container/30 hover:border-primary-container transition-colors"
    >
      {/* Sponsored badge */}
      <div className="absolute top-2 left-2 z-10 bg-primary-container/90 text-on-primary-container text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
        Patrocinado
      </div>

      {/* Image */}
      <div className="h-48 bg-surface-container overflow-hidden relative">
        {ad.imageUrl ? (
          <img src={ad.imageUrl} alt={ad.title ?? "Anúncio"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-surface-container to-surface-container-highest">
            <Icon name="campaign" className="text-4xl text-primary-container" />
            <p className="text-xs text-outline font-medium">Espaço publicitário</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="font-bold text-sm text-on-surface truncate">{ad.title ?? "Anúncio parceiro"}</p>
        {ad.subtitle && <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{ad.subtitle}</p>}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs font-black text-primary-container uppercase tracking-wide flex items-center gap-1">
            {ad.linkLabel ?? "Saiba mais"}
            <Icon name="arrow_forward" className="text-xs" />
          </span>
        </div>
      </div>
    </Link>
  );
}
