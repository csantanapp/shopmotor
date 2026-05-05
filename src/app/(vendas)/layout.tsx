"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

function ErpGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [planLoading, setPlanLoading] = useState(true);
  const [hasErpAccess, setHasErpAccess] = useState(false);

  useAuthRedirect();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login?redirect=/vendas"); return; }
    if ((user as { accountType?: string }).accountType !== "PJ") { router.push("/"); return; }

    // Verifica se o plano ativo é ELITE (único com acesso ao ERP)
    fetch("/api/vehicles/check-limit")
      .then(r => r.json())
      .then(d => {
        const plan: string | null = d.subPlan ?? null;
        if (plan === "ELITE") {
          setHasErpAccess(true);
        } else {
          // Sem plano Pro — redireciona para o perfil
          router.push("/perfil");
        }
      })
      .catch(() => router.push("/perfil"))
      .finally(() => setPlanLoading(false));
  }, [user, loading, router]);

  if (loading || planLoading || !user || (user as { accountType?: string }).accountType !== "PJ") {
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
      <ErpGuard>{children}</ErpGuard>
    </AuthProvider>
  );
}
