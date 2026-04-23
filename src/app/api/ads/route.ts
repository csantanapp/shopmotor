import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slot = searchParams.get("slot");

  const where: any = { active: true };
  if (slot) where.slot = slot;

  const ads = await (prisma as any).partnerAd.findMany({ where, orderBy: { updatedAt: "desc" } });
  return NextResponse.json(ads);
}
