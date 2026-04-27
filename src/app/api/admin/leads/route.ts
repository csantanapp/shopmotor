import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const take = 20;
  const skip = (page - 1) * take;
  const db = prisma;

  const where: any = {};
  if (search) where.OR = [
    { nome: { contains: search, mode: "insensitive" } },
    { email: { contains: search, mode: "insensitive" } },
    { cidade: { contains: search, mode: "insensitive" } },
    { whatsapp: { contains: search } },
  ];
  if (status) where.status = status;

  const [items, total] = await Promise.all([
    db.financiamentoLead.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
    db.financiamentoLead.count({ where }),
  ]);

  const counts = await db.financiamentoLead.groupBy({ by: ["status"], _count: { id: true } });
  const statusCounts = Object.fromEntries(counts.map((r: any) => [r.status, r._count.id]));

  return NextResponse.json({ items, total, pages: Math.ceil(total / take), statusCounts });
}

export async function PATCH(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const { id, status } = await req.json();
  await prisma.financiamentoLead.update({ where: { id }, data: { status } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.financiamentoLead.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
