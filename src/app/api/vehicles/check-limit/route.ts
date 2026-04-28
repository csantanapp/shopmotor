import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PJ_FREE_LIMIT, STORE_PLANS, StorePlan } from "@/lib/store-plans";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const u = user as any;
  const isPJ = (u.accountType ?? "PF") === "PJ";

  let limit: number;
  let subPlan: string | null = null;

  if (isPJ) {
    // Busca assinatura ativa do lojista
    const now = new Date();
    const activeSub = await (prisma as any).storeSubscription.findFirst({
      where: { userId: user.id, status: "active", endsAt: { gt: now } },
      orderBy: { endsAt: "desc" },
      select: { plan: true },
    });
    subPlan = activeSub?.plan ?? null;
    const planData = subPlan ? STORE_PLANS[subPlan as StorePlan] : null;
    limit = planData ? planData.anunciosTotal : PJ_FREE_LIMIT;
  } else {
    // PF: 3 (FREE) ou 20 (PREMIUM)
    limit = user.plan === "PREMIUM" ? 20 : 3;
  }

  const activeCount = await prisma.vehicle.count({
    where: { userId: user.id, status: "ACTIVE" },
  });

  // FIFO: anúncio mais antigo elegível para publicação gratuita quando há vaga
  let fifoEligibleId: string | null = null;
  if (activeCount < limit) {
    const eligible = await prisma.vehicle.findFirst({
      where: {
        userId: user.id,
        OR: [
          { status: "EXPIRED", renewalCount: { lt: 2 } },
          { status: "DRAFT", photos: { some: {} } },
        ],
      },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    fifoEligibleId = eligible?.id ?? null;
  }

  return NextResponse.json({ overLimit: activeCount >= limit, activeCount, limit, fifoEligibleId, isPJ, subPlan });
}
