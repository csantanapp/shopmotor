import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const db = prisma as any;
  const { searchParams } = new URL(req.url);
  const q      = searchParams.get("q") ?? "";
  const page   = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit  = 20;
  const skip   = (page - 1) * limit;
  const plan   = searchParams.get("plan") ?? "";
  const role   = searchParams.get("role") ?? "";

  const where: any = { accountType: "PF" };
  if (q) where.OR = [
    { name:  { contains: q, mode: "insensitive" } },
    { email: { contains: q, mode: "insensitive" } },
  ];
  if (plan) where.plan = plan;
  if (role) where.role = role;

  const [total, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true, name: true, email: true, phone: true,
        city: true, state: true, plan: true, role: true,
        createdAt: true, lastSeenAt: true,
        nickname: true, gender: true,
        _count: { select: { vehicles: true } },
      },
    }),
  ]);

  return NextResponse.json({ users, total, page, pages: Math.ceil(total / limit) });
}

export async function PATCH(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const db = prisma as any;
  const { id, ...data } = await req.json();
  if (!id) return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });

  const user = await db.user.update({ where: { id }, data });
  return NextResponse.json({ user });
}

export async function DELETE(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const db = prisma as any;
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });

  await db.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
