import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: Request) {
  const err = await requireAdmin(req);
  if (err) return err;
  const ads = await (prisma as any).partnerAd.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(ads);
}

export async function POST(req: Request) {
  const err = await requireAdmin(req);
  if (err) return err;
  const body = await req.json();
  const ad = await (prisma as any).partnerAd.create({ data: body });
  return NextResponse.json(ad);
}
