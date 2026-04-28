import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendExpirationEmail } from "@/lib/vehicle-emails";

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Busca veículos ACTIVE expirados com dados do dono
  const expired = await prisma.vehicle.findMany({
    where: { status: "ACTIVE", expiresAt: { lte: now } },
    select: {
      id: true, brand: true, model: true, yearFab: true, renewalCount: true,
      user: { select: { id: true, email: true, name: true } },
    },
  });

  if (expired.length === 0) return NextResponse.json({ expired: 0, at: now });

  // Marca todos como EXPIRED
  await prisma.vehicle.updateMany({
    where: { id: { in: expired.map(v => v.id) } },
    data: { status: "EXPIRED" },
  });

  // Envia emails (fire-and-forget, sem bloquear o cron)
  for (const v of expired) {
    sendExpirationEmail(
      { id: v.user.id, email: v.user.email, name: v.user.name ?? "Anunciante" },
      { id: v.id, brand: v.brand, model: v.model, yearFab: v.yearFab },
      v.renewalCount,
    ).catch(e => console.error("[expire-cron] email error", v.id, e));
  }

  return NextResponse.json({ expired: expired.length, at: now });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
