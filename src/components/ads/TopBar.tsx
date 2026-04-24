"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Ad {
  id: string; active: boolean;
  title?: string; linkUrl?: string; linkLabel?: string;
  bgColor?: string; textColor?: string; imageUrl?: string;
}

export default function TopBar() {
  const [ad, setAd] = useState<Ad | null>(null);
  const [dismissed] = useState(false);

  useEffect(() => {
    fetch("/api/ads?slot=home_topbar")
      .then(r => r.json())
      .then((ads: Ad[]) => setAd(ads[0] ?? null));
  }, []);

  if (!ad || dismissed) return null;

  const bg = ad.bgColor ?? "#e63946";
  const color = ad.textColor ?? "#ffffff";

  const wrapper = (inner: React.ReactNode) =>
    ad.linkUrl ? (
      <Link href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full h-full hover:opacity-90">
        {inner}
      </Link>
    ) : <>{inner}</>;

  return (
    <div
      className="w-full relative overflow-hidden"
      style={{ background: bg, color, height: 40, minHeight: 40, maxHeight: 40 }}
    >
      {ad.imageUrl ? (
        wrapper(<img src={ad.imageUrl} alt={ad.title ?? "Anúncio"} className="w-full h-full object-cover" />)
      ) : (
        <div className="w-full h-full flex items-center justify-center px-10">
          {wrapper(
            <span className="font-semibold text-xs md:text-sm">
              {ad.title}
              {ad.linkLabel && <span className="ml-3 underline underline-offset-2 font-black">{ad.linkLabel} →</span>}
            </span>
          )}
        </div>
      )}

    </div>
  );
}
