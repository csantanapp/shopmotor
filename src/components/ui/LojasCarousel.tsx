"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

interface StoreUser {
  id: string;
  name: string;
  tradeName: string | null;
  avatarUrl: string | null;
  storeSlug: string | null;
  city: string | null;
  state: string | null;
}

const PAGE_SIZE = 4;
const AUTO_ROTATE_MS = 3500;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function LojasCarousel({ lojas }: { lojas: StoreUser[] }) {
  const [ordered, setOrdered] = useState<StoreUser[]>([]);
  const [page, setPage] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setOrdered(shuffle(lojas));
  }, [lojas]);

  const totalPages = Math.ceil(ordered.length / PAGE_SIZE);

  const next = useCallback(() => {
    setPage(p => (p + 1) % totalPages);
  }, [totalPages]);

  const prev = useCallback(() => {
    setPage(p => (p - 1 + totalPages) % totalPages);
  }, [totalPages]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, AUTO_ROTATE_MS);
  }, [next]);

  useEffect(() => {
    if (ordered.length <= PAGE_SIZE) return;
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [ordered, resetTimer]);

  const visible = ordered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  if (ordered.length === 0) return null;

  return (
    <section className="max-w-screen-2xl mx-auto px-6 pb-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Parceiros verificados</p>
          <h3 className="text-2xl font-black uppercase tracking-tighter">Lojas em destaque</h3>
          <div className="h-1 w-16 bg-primary-container mt-2" />
        </div>

      </div>

      <div className="flex items-center gap-3">
        {totalPages > 1 && (
          <button
            onClick={() => { prev(); resetTimer(); }}
            aria-label="Anterior"
            className="flex-shrink-0 w-9 h-9 bg-surface-container hover:bg-surface-container-high rounded-full flex items-center justify-center transition-colors"
          >
            <Icon name="chevron_left" className="text-xl" />
          </button>
        )}

        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
          {visible.map((shop) => (
          <Link
            key={shop.id}
            href={shop.storeSlug ? `/loja/${shop.storeSlug}` : `/vendedor/${shop.id}`}
            className="bg-surface-container-lowest rounded-2xl p-5 flex flex-col items-center text-center border border-transparent hover:border-primary-container transition-all shadow-sm group"
          >
            <div className="w-16 h-16 bg-surface-container rounded-full mb-3 overflow-hidden flex items-center justify-center group-hover:ring-2 group-hover:ring-primary-container transition-all">
              {shop.avatarUrl
                ? <img src={shop.avatarUrl} alt={shop.name} className="w-full h-full object-cover" />
                : <Icon name="storefront" className="text-2xl text-outline" />
              }
            </div>
            <span className="font-bold text-sm text-on-surface uppercase tracking-tight mb-1 truncate w-full">
              {shop.tradeName ?? shop.name}
            </span>
            {(shop.city || shop.state) && (
              <span className="text-[11px] text-on-surface-variant flex items-center gap-1 justify-center">
                <Icon name="location_on" className="text-xs text-primary" />
                {[shop.city, shop.state].filter(Boolean).join(", ")}
              </span>
            )}
          </Link>
        ))}
        </div>

        {totalPages > 1 && (
          <button
            onClick={() => { next(); resetTimer(); }}
            aria-label="Próximo"
            className="flex-shrink-0 w-9 h-9 bg-surface-container hover:bg-surface-container-high rounded-full flex items-center justify-center transition-colors"
          >
            <Icon name="chevron_right" className="text-xl" />
          </button>
        )}
      </div>

      {/* Dots */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => { setPage(i); resetTimer(); }}
              aria-label={`Página ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === page ? "w-6 bg-primary-container" : "w-1.5 bg-outline-variant"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
