"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "sm_cookie_consent";

interface Prefs {
  analytics: boolean;
  marketing: boolean;
  experience: boolean;
}

const DEFAULT_PREFS: Prefs = { analytics: true, marketing: true, experience: true };

function loadPrefs(): Prefs | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function savePrefs(prefs: Prefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-primary" : "bg-outline-variant"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [modal, setModal] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);

  useEffect(() => {
    if (!loadPrefs()) setShow(true);
  }, []);

  function acceptAll() {
    savePrefs({ analytics: true, marketing: true, experience: true });
    setShow(false);
    setModal(false);
  }

  function saveSelected() {
    savePrefs(prefs);
    setShow(false);
    setModal(false);
  }

  function set(key: keyof Prefs) {
    return (v: boolean) => setPrefs(p => ({ ...p, [key]: v }));
  }

  if (!show) return null;

  return (
    <>
      {/* ── Banner ── */}
      {!modal && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container border-t border-outline-variant shadow-xl px-4 py-4 md:py-5">
          <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-2xl">
              <span className="font-black text-on-surface">A ShopMotor usa Cookies</span>, pequenos arquivos para aprimorar e proteger a sua experiência.{" "}
              <button onClick={() => setModal(true)} className="text-primary font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity">
                Clique aqui para mudar suas preferências
              </button>{" "}
              ou saiba mais na nossa{" "}
              <Link href="/termos" className="text-primary font-semibold underline underline-offset-2 hover:opacity-80">Termos de Uso</Link>,{" "}
              <Link href="/privacidade" className="text-primary font-semibold underline underline-offset-2 hover:opacity-80">Política de Privacidade</Link>{" "}
              e{" "}
              <Link href="/cookies" className="text-primary font-semibold underline underline-offset-2 hover:opacity-80">Política de Cookies</Link>.
            </p>
            <button
              onClick={acceptAll}
              className="flex-shrink-0 bg-primary text-on-primary font-black px-8 py-3 rounded-full text-sm uppercase tracking-widest hover:-translate-y-0.5 transition-all w-full md:w-auto"
            >
              Aceitar todos
            </button>
          </div>
        </div>
      )}

      {/* ── Modal ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative bg-surface rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-outline-variant sticky top-0 bg-surface rounded-t-3xl">
              <h2 className="text-lg font-black text-on-surface">Uso de Cookies</h2>
              <button onClick={() => setModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant text-xl">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Os Cookies são pequenos arquivos que ajustam a sua navegação para que você tenha a melhor experiência na ShopMotor. Saiba mais na nossa{" "}
                <Link href="/privacidade" className="text-primary font-semibold underline underline-offset-2">Política de Privacidade</Link>{" "}
                e{" "}
                <Link href="/cookies" className="text-primary font-semibold underline underline-offset-2">Política de Cookies</Link>.
              </p>
              <p className="text-sm font-bold text-on-surface">Defina os tipos de Cookies que podemos usar:</p>

              {/* Essenciais — sempre ativo */}
              <CookieRow
                title="Essenciais"
                desc="São cookies indispensáveis para manter sua sessão ativa e suas preferências de navegação. Sem eles, a plataforma não funciona corretamente."
                locked
              />

              {/* Analíticos */}
              <CookieRow
                title="Analíticos"
                desc="Nos ajudam a entender como a plataforma é utilizada, de forma anonimizada, para que possamos melhorar continuamente a experiência."
                checked={prefs.analytics}
                onChange={set("analytics")}
              />

              {/* Marketing */}
              <CookieRow
                title="Marketing"
                desc="Usamos dados de navegação para mostrar anúncios relevantes dentro da plataforma. Eles não são compartilhados com terceiros e não revelam dados de pagamento."
                checked={prefs.marketing}
                onChange={set("marketing")}
              />

              {/* Experiência */}
              <CookieRow
                title="Experiência"
                desc="Coletamos informações para personalizar sua experiência, como filtros salvos, buscas recentes e preferências de visualização."
                checked={prefs.experience}
                onChange={set("experience")}
              />
            </div>

            {/* Footer */}
            <div className="p-6 pt-0 sticky bottom-0 bg-surface">
              <button
                onClick={saveSelected}
                className="w-full bg-primary text-on-primary font-black py-4 rounded-2xl text-sm uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                Salvar preferências
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CookieRow({
  title, desc, checked, onChange, locked,
}: {
  title: string;
  desc: string;
  checked?: boolean;
  onChange?: (v: boolean) => void;
  locked?: boolean;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-1">
        <p className="font-black text-on-surface text-sm mb-1">{title}</p>
        <p className="text-xs text-on-surface-variant leading-relaxed">{desc}</p>
      </div>
      {locked ? (
        <div className="flex-shrink-0 flex items-center gap-1 mt-0.5">
          <span className="material-symbols-outlined text-primary text-xl">check</span>
        </div>
      ) : (
        <div className="mt-0.5">
          <Toggle checked={checked!} onChange={onChange!} />
        </div>
      )}
    </div>
  );
}
