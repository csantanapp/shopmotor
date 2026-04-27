import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

function sanitize(body: any) {
  const d = { ...body };
  // Converte strings vazias em DateTime para null
  if (d.startsAt === "" || d.startsAt === null) d.startsAt = null;
  else if (d.startsAt) d.startsAt = new Date(d.startsAt);
  if (d.endsAt === "" || d.endsAt === null) d.endsAt = null;
  else if (d.endsAt) d.endsAt = new Date(d.endsAt);
  // popupDelay deve ser número
  if (d.popupDelay !== undefined) d.popupDelay = Number(d.popupDelay) || 0;
  return d;
}

export async function GET(req: Request) {
  const err = await requireAdmin(req);
  if (err) return err;
  const ads = await prisma.partnerAd.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(ads);
}

export async function POST(req: Request) {
  const err = await requireAdmin(req);
  if (err) return err;
  const body = sanitize(await req.json());
  const ad = await prisma.partnerAd.create({ data: body });
  return NextResponse.json(ad);
}
