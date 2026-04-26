"use client";

import { useEffect } from "react";

const STORAGE_KEY = "sm_cookie_consent";

interface Prefs {
  analytics: boolean;
  marketing: boolean;
  experience: boolean;
}

function loadPrefs(): Prefs | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ── Google Analytics (gtag.js) ──────────────────────────────────────────────
// Substitua GA_MEASUREMENT_ID pelo seu ID real (ex: G-XXXXXXXXXX)
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

function loadGoogleAnalytics() {
  if (!GA_ID || document.getElementById("sm-ga-script")) return;

  const script1 = document.createElement("script");
  script1.id = "sm-ga-script";
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script1);

  const script2 = document.createElement("script");
  script2.id = "sm-ga-init";
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_ID}', { anonymize_ip: true });
  `;
  document.head.appendChild(script2);
}

// ── Meta Pixel (fbq) ────────────────────────────────────────────────────────
// Substitua META_PIXEL_ID pelo seu ID real (ex: 1234567890)
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

function loadMetaPixel() {
  if (!META_PIXEL_ID || document.getElementById("sm-meta-pixel")) return;

  const script = document.createElement("script");
  script.id = "sm-meta-pixel";
  script.innerHTML = `
    !function(f,b,e,v,n,t,s){
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)
    }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${META_PIXEL_ID}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);
}

// ── Google Tag Manager ──────────────────────────────────────────────────────
// Substitua GTM_ID pelo seu ID real (ex: GTM-XXXXXXX)
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";

function loadGTM() {
  if (!GTM_ID || document.getElementById("sm-gtm-script")) return;

  const script = document.createElement("script");
  script.id = "sm-gtm-script";
  script.innerHTML = `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;
    j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
    f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${GTM_ID}');
  `;
  document.head.appendChild(script);
}

// ── Componente principal ────────────────────────────────────────────────────
export default function CookieManager() {
  useEffect(() => {
    function applyPrefs(prefs: Prefs | null) {
      if (!prefs) return; // sem consentimento, nenhum script carrega

      // analytics → Google Analytics + GTM
      if (prefs.analytics) {
        loadGoogleAnalytics();
        loadGTM();
      }

      // marketing → Meta Pixel
      if (prefs.marketing) {
        loadMetaPixel();
      }

      // experience → reservado para ferramentas de personalização futuras
      // ex: Hotjar, FullStory, etc.
    }

    // Aplica na carga inicial
    applyPrefs(loadPrefs());

    // Reaplica sempre que o usuário salvar novas preferências
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) applyPrefs(loadPrefs());
    }

    window.addEventListener("storage", onStorage);

    // Evento customizado para quando o usuário salva no mesmo tab
    function onConsentSaved() { applyPrefs(loadPrefs()); }
    window.addEventListener("sm:consent-saved", onConsentSaved);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("sm:consent-saved", onConsentSaved);
    };
  }, []);

  return null;
}
