"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Ad {
  id: string; slot: string; active: boolean;
  title?: string; subtitle?: string; imageUrl?: string;
  linkUrl?: string; linkLabel?: string;
}

export default function AdBanner({ slot, maxHeight = 90 }: { slot: string; maxHeight?: number }) {
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    fetch(`/api/ads?slot=${slot}`)
      .then(r => r.json())
      .then((ads: Ad[]) => setAd(ads[0] ?? null));
  }, [slot]);

  if (!ad) return null;

  const inner = (
    <div
      className="w-full overflow-hidden rounded-xl relative bg-surface-container"
      style={{ height: maxHeight }}
    >
      {ad.imageUrl ? (
        <img
          src={ad.imageUrl}
          alt={ad.title ?? "Anúncio"}
          style={{ width: "100%", height: "100%", display: "block", objectFit: "fill" }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center gap-4 px-6"
          style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}>
          {ad.title && <p className="text-white font-black text-lg">{ad.title}</p>}
          {ad.subtitle && <p className="text-neutral-400 text-sm">{ad.subtitle}</p>}
          {ad.linkLabel && (
            <span className="ml-auto text-xs font-black uppercase tracking-widest px-4 py-2 bg-primary-container text-on-primary-container rounded-lg whitespace-nowrap">
              {ad.linkLabel}
            </span>
          )}
        </div>
      )}
      <span className="absolute top-1 right-2 text-[9px] text-white/30 font-medium">anúncio</span>
    </div>
  );

  if (ad.linkUrl) {
    return (
      <Link href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
        {inner}
      </Link>
    );
  }
  return inner;
}
