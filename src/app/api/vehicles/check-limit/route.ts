import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const u = user as any;
  const isPF = (u.accountType ?? "PF") !== "PJ";
  if (!isPF) return NextResponse.json({ overLimit: false });

  const limit = user.plan === "PREMIUM" ? 20 : 3;
  const activeCount = await prisma.vehicle.count({
    where: { userId: user.id, status: "ACTIVE" },
  });

  return NextResponse.json({ overLimit: activeCount >= limit, activeCount, limit });
}
