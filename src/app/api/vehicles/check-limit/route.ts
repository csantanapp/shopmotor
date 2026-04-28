import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const u = user as any;
  const isPF = (u.accountType ?? "PF") !== "PJ";
  if (!isPF) return NextResponse.json({ overLimit: false, activeCount: 0, limit: 999, fifoEligibleId: null });

  const limit = user.plan === "PREMIUM" ? 20 : 3;
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

  return NextResponse.json({ overLimit: activeCount >= limit, activeCount, limit, fifoEligibleId });
}
