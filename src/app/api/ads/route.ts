import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slot = searchParams.get("slot");
  const now = new Date();

  const where: any = {
    active: true,
    OR: [{ startsAt: null }, { startsAt: { lte: now } }],
    AND: [
      { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
    ],
  };
  if (slot) where.slot = slot;

  const ads = await prisma.partnerAd.findMany({ where, orderBy: { updatedAt: "desc" } });
  return NextResponse.json(ads);
}
