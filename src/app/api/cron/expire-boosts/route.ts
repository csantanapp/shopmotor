import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

// Roda a cada hora — reseta boosts vencidos e retorna veículos ao estado correto
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Veículos com boost ativo que já venceu
  const boosted = await prisma.vehicle.findMany({
    where: {
      boostPlan: { not: "NONE" },
      boostUntil: { lte: now },
    },
    select: {
      id: true, brand: true, model: true, yearFab: true,
      renewalCount: true, userId: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (boosted.length === 0) return NextResponse.json({ reset: 0, at: now });

  for (const v of boosted) {
    // Ciclo gratuito esgotado → volta para EXPIRED; caso contrário mantém ACTIVE (expiresAt já gerencia)
    const returnsToExpired = v.renewalCount >= 2;

    await prisma.vehicle.update({
      where: { id: v.id },
      data: {
        boostPlan: "NONE",
        boostLevel: "NONE",
        boostUntil: null,
        boostTopUntil: null,
        boostGalleryUntil: null,
        ...(returnsToExpired && { status: "EXPIRED" }),
      },
    });

    if (returnsToExpired) {
      createNotification({
        userId: v.user.id,
        type: "cycle_exhausted",
        title: `Impulsionamento encerrado — ${v.brand} ${v.model} ${v.yearFab}`,
        body: "O período de impulsionamento terminou. Seu anúncio foi removido das buscas. Impulsione novamente para reativar.",
        vehicleId: v.id,
        actionUrl: `/perfil/impulsionar/${v.id}`,
      }).catch(() => {});
    }
  }

  return NextResponse.json({ reset: boosted.length, at: now });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
