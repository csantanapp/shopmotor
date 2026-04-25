import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Chamado por cron externo (ex: cron-job.org) — protegido por CRON_SECRET
// Regra:
//   renewalCount < 2  → marca EXPIRED (pode ser renovado)
//   renewalCount >= 2 → marca EXPIRED e bloqueia edição (já usou 2 períodos)
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const { count } = await prisma.vehicle.updateMany({
    where: { status: "ACTIVE", expiresAt: { lte: now } },
    data:  { status: "EXPIRED" },
  });

  return NextResponse.json({ expired: count, at: now });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
