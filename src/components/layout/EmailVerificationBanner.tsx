"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import Link from "next/link";

export default function EmailVerificationBanner() {
  const { user, loading } = useAuth();
  const [resent, setResent] = useState(false);
  const [sending, setSending] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (loading || !user || user.emailVerified || dismissed) return null;

  const resend = async () => {
    setSending(true);
    try {
      await fetch("/api/auth/resend-verification", { method: "POST" });
      setResent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-yellow-400 text-black px-4 py-2.5 flex items-center justify-between gap-4 text-sm font-medium">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span className="truncate">
          {resent
            ? "E-mail reenviado! Verifique sua caixa de entrada."
            : "Confirme seu e-mail para ter acesso completo à plataforma."}
        </span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {!resent && (
          <button
            onClick={resend}
            disabled={sending}
            className="underline underline-offset-2 hover:no-underline font-bold disabled:opacity-50"
          >
            {sending ? "Enviando..." : "Reenviar e-mail"}
          </button>
        )}
        <button onClick={() => setDismissed(true)} aria-label="Fechar" className="hover:opacity-70">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
