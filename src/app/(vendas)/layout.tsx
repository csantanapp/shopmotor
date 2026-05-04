"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

function ErpGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Intercepts any 401 from API calls and redirects to /login
  useAuthRedirect();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login?redirect=/vendas"); return; }
    if ((user as { accountType?: string }).accountType !== "PJ") { router.push("/"); return; }
  }, [user, loading, router]);

  if (loading || !user || (user as { accountType?: string }).accountType !== "PJ") {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-primary-container/30 border-t-primary-container rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

export default function VendasLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ErpGuard>{children}</ErpGuard>
    </AuthProvider>
  );
}
