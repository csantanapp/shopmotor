import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Chamado por cron externo (ex: cron-job.org) ou pelo próprio servidor
// Protegido por CRON_SECRET no header Authorization
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

// Também aceita GET para facilitar teste manual em dev
export async function GET(req: NextRequest) {
  return POST(req);
}
