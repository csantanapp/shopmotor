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

  const hasText = ad.title || ad.subtitle || ad.linkLabel;

  const inner = (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm relative group border border-primary-container/30 hover:border-primary-container transition-colors">
      {/* Sponsored badge */}
      <div className="absolute top-2 left-2 z-10 bg-primary-container/90 text-on-primary-container text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
        Patrocinado
      </div>

      {/* Image — full card if no text */}
      <div className={`bg-surface-container overflow-hidden relative ${hasText ? "h-48" : "h-full min-h-[340px]"}`}>
        {ad.imageUrl ? (
          <img
            src={ad.imageUrl}
            alt={ad.title ?? "Anúncio"}
            style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
            className="group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-surface-container to-surface-container-highest">
            <Icon name="campaign" className="text-4xl text-primary-container" />
            <p className="text-xs text-outline font-medium">Espaço publicitário</p>
          </div>
        )}
      </div>

      {/* Content — only if has text */}
      {hasText && (
        <div className="p-4">
          {ad.title && <p className="font-bold text-sm text-on-surface truncate">{ad.title}</p>}
          {ad.subtitle && <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{ad.subtitle}</p>}
          {ad.linkLabel && (
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs font-black text-primary-container uppercase tracking-wide flex items-center gap-1">
                {ad.linkLabel}
                <Icon name="arrow_forward" className="text-xs" />
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (ad.linkUrl) {
    return (
      <Link href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}
