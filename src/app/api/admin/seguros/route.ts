import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const page   = Math.max(1, Number(searchParams.get("page") ?? 1));
  const take   = 20;

  const where = status ? { status } : {};

  const [items, total] = await Promise.all([
    prisma.seguroLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * take,
      take,
    }),
    prisma.seguroLead.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pages: Math.ceil(total / take) });
}

export async function PATCH(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const { id, status } = await req.json();
  await prisma.seguroLead.update({ where: { id }, data: { status } });
  return NextResponse.json({ ok: true });
}
