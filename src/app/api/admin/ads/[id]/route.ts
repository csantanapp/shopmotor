import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const err = await requireAdmin(req);
  if (err) return err;
  const body = await req.json();
  const ad = await (prisma as any).partnerAd.update({ where: { id: params.id }, data: body });
  return NextResponse.json(ad);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const err = await requireAdmin(req);
  if (err) return err;
  await (prisma as any).partnerAd.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
