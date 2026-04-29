"use client";

import { useEffect, useState, useCallback } from "react";

type Banner = { url: string; title?: string; subtitle?: string };

export default function HeroCarousel({ fallback }: { fallback: string }) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch("/api/hero-banners")
      .then(r => r.json())
      .then((data: Banner[]) => {
        if (Array.isArray(data) && data.length > 0) setBanners(data);
      })
      .catch(() => {});
  }, []);

  const list = banners.length > 0 ? banners : [{ url: fallback }];

  const next = useCallback(() => setCurrent(c => (c + 1) % list.length), [list.length]);
  const prev = () => setCurrent(c => (c - 1 + list.length) % list.length);

  useEffect(() => {
    if (list.length <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [list.length, next]);

  return (
    <>
      {list.map((b, i) => (
        <div
          key={b.url + i}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? "opacity-100" : "opacity-0"}`}
        >
          <img src={b.url} alt="" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-inverse-surface/60 via-inverse-surface/75 to-inverse-surface" />
        </div>
      ))}

      {list.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Próximo"
          >
            ›
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {list.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-yellow-500 w-6" : "bg-white/40"}`}
                aria-label={`Banner ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
