import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await requireAdmin(req);
  if (err) return err;
  const { id } = await params;
  const db = prisma as any;

  const uses = await db.couponUse.findMany({
    where: { couponId: id },
    orderBy: { usedAt: "desc" },
    include: {
      // join manual via userId
    },
  });

  // Buscar dados dos usuários
  const userIds = [...new Set(uses.map((u: any) => u.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds as string[] } },
    select: { id: true, name: true, email: true, accountType: true },
  });
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  return NextResponse.json(uses.map((u: any) => ({
    ...u,
    user: userMap[u.userId] ?? null,
  })));
}
