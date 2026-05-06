"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ErpAuthProvider, useErpAuth } from "@/context/ErpAuthContext";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

function ErpGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { colaborador, loading: erpLoading } = useErpAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Página de login do colaborador — sem guard
  if (pathname === "/vendas/login") return <>{children}</>;
  const [planLoading, setPlanLoading] = useState(true);
  const [hasErpAccess, setHasErpAccess] = useState(false);

  useAuthRedirect();

  useEffect(() => {
    // Se há colaborador logado via erp_token — acesso direto
    if (!erpLoading && colaborador) {
      setHasErpAccess(true);
      setPlanLoading(false);
      return;
    }

    // Aguarda ambos carregarem
    if (erpLoading || authLoading) return;

    // Sem colaborador e sem usuário — redireciona para login de colaborador
    if (!colaborador && !user) {
      router.push("/vendas/login");
      setPlanLoading(false);
      return;
    }

    // Usuário logado como dono (PJ) — verifica plano
    if (user) {
      if ((user as { accountType?: string }).accountType !== "PJ") {
        router.push("/");
        setPlanLoading(false);
        return;
      }

      fetch("/api/vehicles/check-limit")
        .then(r => r.json())
        .then(d => {
          if (d.subPlan === "ELITE") {
            setHasErpAccess(true);
          } else {
            router.push("/perfil");
          }
        })
        .catch(() => router.push("/perfil"))
        .finally(() => setPlanLoading(false));
    }
  }, [user, authLoading, colaborador, erpLoading, router]);

  const isLoading = authLoading || erpLoading || planLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasErpAccess) return null;

  return <>{children}</>;
}

export default function VendasLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ErpAuthProvider>
        <ErpGuard>{children}</ErpGuard>
      </ErpAuthProvider>
    </AuthProvider>
  );
}
