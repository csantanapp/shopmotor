import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendExpirationWarningEmail } from "@/lib/vehicle-emails";

// Roda 1x por dia — avisa anunciantes cujo anúncio expira em ~3 dias
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  // Janela: entre 2.5 e 3.5 dias a partir de agora (evita duplicatas em runs diários)
  const windowStart = new Date(now.getTime() + 2.5 * 24 * 60 * 60 * 1000);
  const windowEnd   = new Date(now.getTime() + 3.5 * 24 * 60 * 60 * 1000);

  const expiring = await prisma.vehicle.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { gte: windowStart, lte: windowEnd },
    },
    select: {
      id: true, brand: true, model: true, yearFab: true, renewalCount: true, expiresAt: true,
      user: { select: { email: true, name: true, accountType: true } },
    },
  });

  // Filtra apenas PF (PJ têm ciclo diferente)
  const pf = expiring.filter(v => (v.user as any).accountType !== "PJ");

  for (const v of pf) {
    const daysLeft = Math.ceil(
      ((v.expiresAt?.getTime() ?? 0) - now.getTime()) / (24 * 60 * 60 * 1000)
    );
    sendExpirationWarningEmail(
      { email: v.user.email, name: v.user.name ?? "Anunciante" },
      { id: v.id, brand: v.brand, model: v.model, yearFab: v.yearFab },
      daysLeft,
      v.renewalCount,
    ).catch(e => console.error("[warn-cron] email error", v.id, e));
  }

  return NextResponse.json({ warned: pf.length, at: now });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
