import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const search = searchParams.get("search") ?? "";
  const plan = searchParams.get("plan") ?? "";
  const status = searchParams.get("status") ?? "";
  const take = 20;
  const skip = (page - 1) * take;
  const db = prisma;

  const where: any = {};
  if (plan) where.plan = plan;
  if (status) where.status = status;
  if (search) where.user = { OR: [
    { name: { contains: search, mode: "insensitive" } },
    { email: { contains: search, mode: "insensitive" } },
    { tradeName: { contains: search, mode: "insensitive" } },
  ]};

  const [items, total] = await Promise.all([
    db.storeSubscription.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true, tradeName: true, storeSlug: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    db.storeSubscription.count({ where }),
  ]);

  const stats = await db.storeSubscription.groupBy({
    by: ["plan", "status"], _count: { id: true },
  });

  const revenue = await db.storeSubscription.aggregate({
    _sum: { amount: true },
    where: { status: "active" },
  });

  return NextResponse.json({ items, total, pages: Math.ceil(total / take), stats, revenue: revenue._sum.amount ?? 0 });
}

export async function PATCH(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const { id, status } = await req.json();
  const db = prisma;

  const data: any = { status };
  if (status === "active" && !data.startsAt) {
    data.startsAt = new Date();
    data.endsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  await db.storeSubscription.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}
