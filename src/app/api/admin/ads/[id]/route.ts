import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

function sanitize(body: any) {
  const d = { ...body };
  if (d.startsAt === "" || d.startsAt === null) d.startsAt = null;
  else if (d.startsAt) d.startsAt = new Date(d.startsAt);
  if (d.endsAt === "" || d.endsAt === null) d.endsAt = null;
  else if (d.endsAt) d.endsAt = new Date(d.endsAt);
  if (d.popupDelay !== undefined) d.popupDelay = Number(d.popupDelay) || 0;
  return d;
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const err = await requireAdmin(req);
  if (err) return err;
  const body = sanitize(await req.json());
  const ad = await (prisma as any).partnerAd.update({ where: { id: params.id }, data: body });
  return NextResponse.json(ad);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const err = await requireAdmin(req);
  if (err) return err;
  await (prisma as any).partnerAd.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
