import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const level = req.nextUrl.searchParams.get("level") as "DESTAQUE" | "ELITE" | null;
  if (!level || !["DESTAQUE", "ELITE"].includes(level)) {
    return NextResponse.json({ error: "level inválido." }, { status: 400 });
  }

  const now = new Date();
  const vehicles = await prisma.vehicle.findMany({
    where: {
      status: "ACTIVE",
      boostLevel: level,
      OR: [{ boostUntil: null }, { boostUntil: { gte: now } }],
    },
    orderBy: { updatedAt: "desc" },
    take: 8,
    select: {
      id: true, brand: true, model: true, version: true,
      yearFab: true, yearModel: true, km: true, price: true,
      city: true, state: true, condition: true, boostLevel: true,
      photos: { where: { isCover: true }, take: 1, select: { url: true } },
    },
  });

  return NextResponse.json({ vehicles });
}
