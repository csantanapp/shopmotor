"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Ad {
  id: string; active: boolean;
  title?: string; subtitle?: string; imageUrl?: string;
  linkUrl?: string; linkLabel?: string;
  popupDelay?: number; // segundos
}

const SESSION_KEY = "shopmotor_popup_dismissed";

export default function AdPopup() {
  const [ad, setAd] = useState<Ad | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Só mostra se não foi fechado nesta sessão
    if (sessionStorage.getItem(SESSION_KEY)) return;

    fetch("/api/ads?slot=home_popup")
      .then(r => r.json())
      .then((ads: Ad[]) => {
        const found = ads[0] ?? null;
        if (!found) return;
        setAd(found);
        const delay = (found.popupDelay ?? 0) * 1000;
        setTimeout(() => setVisible(true), delay);
      });
  }, []);

  const close = () => {
    setVisible(false);
    sessionStorage.setItem(SESSION_KEY, "1");
  };

  if (!ad || !visible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={close}>
      <div
        className="relative bg-surface-container-lowest rounded-2xl overflow-hidden shadow-2xl w-full"
        style={{ maxWidth: 550 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={close}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white text-sm transition-colors"
          aria-label="Fechar"
        >
          ✕
        </button>

        {/* Image — 550×550 */}
        {ad.imageUrl && (
          <div className="w-full bg-surface-container overflow-hidden" style={{ height: 550 }}>
            <img src={ad.imageUrl} alt={ad.title ?? "Anúncio"} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        {(ad.title || ad.subtitle || ad.linkUrl) && (
          <div className="px-6 py-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              {ad.title && <p className="text-lg font-black text-on-surface leading-tight">{ad.title}</p>}
              {ad.subtitle && <p className="text-sm text-on-surface-variant mt-0.5">{ad.subtitle}</p>}
            </div>
            {ad.linkUrl && (
              <Link
                href={ad.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
                className="flex-shrink-0 inline-flex items-center gap-2 bg-primary-container text-on-primary-container font-black text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                {ad.linkLabel ?? "Saiba mais"}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
