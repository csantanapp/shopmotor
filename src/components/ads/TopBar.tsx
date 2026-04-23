"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

interface Ad {
  id: string; active: boolean;
  title?: string; linkUrl?: string; linkLabel?: string;
  bgColor?: string; textColor?: string;
}

export default function TopBar() {
  const [ad, setAd] = useState<Ad | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/ads?slot=home_topbar")
      .then(r => r.json())
      .then((ads: Ad[]) => setAd(ads[0] ?? null));
  }, []);

  if (!ad || dismissed) return null;

  const bg = ad.bgColor ?? "#e63946";
  const color = ad.textColor ?? "#ffffff";

  const content = (
    <span className="font-semibold text-xs md:text-sm">
      {ad.title}
      {ad.linkLabel && (
        <span className="ml-3 underline underline-offset-2 font-black">{ad.linkLabel} →</span>
      )}
    </span>
  );

  return (
    <div
      className="w-full flex items-center justify-center gap-3 px-4 relative"
      style={{ background: bg, color, height: 36, minHeight: 28, maxHeight: 36 }}
    >
      {ad.linkUrl ? (
        <Link href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-90">
          {content}
        </Link>
      ) : content}

      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Fechar"
      >
        <Icon name="close" className="text-sm" style={{ color }} />
      </button>
    </div>
  );
}
