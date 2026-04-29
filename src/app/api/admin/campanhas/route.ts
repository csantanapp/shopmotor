import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;
  const db = prisma as any;
  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { uses: true } } },
  });
  return NextResponse.json(coupons);
}

export async function POST(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;
  const body = await req.json();
  const db = prisma as any;
  const coupon = await db.coupon.create({
    data: {
      code:          body.code.trim().toUpperCase(),
      description:   body.description   || null,
      discountType:  body.discountType  ?? "percent",
      discountValue: Number(body.discountValue),
      maxUses:       body.maxUses ? Number(body.maxUses) : null,
      validFrom:     body.validFrom  ? new Date(body.validFrom)  : null,
      validUntil:    body.validUntil ? new Date(body.validUntil) : null,
      active:        body.active ?? true,
    },
  });
  return NextResponse.json(coupon, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;
  const body = await req.json();
  const db = prisma as any;
  const data: any = {};
  if (body.code         !== undefined) data.code         = body.code.trim().toUpperCase();
  if (body.description  !== undefined) data.description  = body.description  || null;
  if (body.discountType !== undefined) data.discountType = body.discountType;
  if (body.discountValue!== undefined) data.discountValue= Number(body.discountValue);
  if (body.maxUses      !== undefined) data.maxUses      = body.maxUses ? Number(body.maxUses) : null;
  if (body.validFrom    !== undefined) data.validFrom    = body.validFrom  ? new Date(body.validFrom)  : null;
  if (body.validUntil   !== undefined) data.validUntil   = body.validUntil ? new Date(body.validUntil) : null;
  if (body.active       !== undefined) data.active       = body.active;
  const coupon = await db.coupon.update({ where: { id: body.id }, data });
  return NextResponse.json(coupon);
}

export async function DELETE(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;
  const { id } = await req.json();
  const db = prisma as any;
  await db.coupon.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
