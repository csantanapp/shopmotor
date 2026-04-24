import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await (prisma as any).user.findUnique({
    where: { id: session.user.id },
    select: { accountType: true, plan: true },
  });
  if (user?.accountType !== "PJ") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Verifica plano Elite ativo
  const now = new Date();
  const activeSub = await (prisma as any).storeSubscription.findFirst({
    where: { userId: session.user.id, status: "active", endsAt: { gt: now } },
  });
  if (activeSub?.plan !== "ELITE") return NextResponse.json({ error: "Plano Elite necessário" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page   = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const status = searchParams.get("status") ?? "";
  const limit  = 20;
  const skip   = (page - 1) * limit;

  const where: Record<string, unknown> = { storeUserId: session.user.id };
  if (status) where.status = status;

  const [items, total] = await Promise.all([
    (prisma as any).financiamentoLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    (prisma as any).financiamentoLead.count({ where }),
  ]);

  return NextResponse.json({ items, total, pages: Math.ceil(total / limit) });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status } = await req.json();
  const allowed = ["novo", "contatado", "convertido", "descartado"];
  if (!allowed.includes(status)) return NextResponse.json({ error: "Status inválido" }, { status: 400 });

  const lead = await (prisma as any).financiamentoLead.findUnique({ where: { id }, select: { storeUserId: true } });
  if (lead?.storeUserId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await (prisma as any).financiamentoLead.update({ where: { id }, data: { status } });
  return NextResponse.json({ ok: true });
}
