"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface Colaborador {
  colaboradorId: string;
  lojaUserId: string;
  nome: string;
  email: string;
  grupoId: string;
  grupoNome: string;
  modulos: Record<string, boolean>;
}

interface ErpAuthCtx {
  colaborador: Colaborador | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const Ctx = createContext<ErpAuthCtx>({ colaborador: null, loading: true, logout: async () => {} });

export function ErpAuthProvider({ children }: { children: ReactNode }) {
  const [colaborador, setColaborador] = useState<Colaborador | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/loja/auth")
      .then(r => r.json())
      .then(d => setColaborador(d.colaborador ?? null))
      .catch(() => setColaborador(null))
      .finally(() => setLoading(false));
  }, []);

  async function logout() {
    await fetch("/api/loja/auth", { method: "DELETE" });
    setColaborador(null);
    window.location.href = "/vendas/login";
  }

  return <Ctx.Provider value={{ colaborador, loading, logout }}>{children}</Ctx.Provider>;
}

export function useErpAuth() { return useContext(Ctx); }
