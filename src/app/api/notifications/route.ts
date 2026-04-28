import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET — lista notificações do usuário (últimas 30)
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ notifications: [] }, { status: 401 });

  const notifications = await (prisma as any).notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json({ notifications });
}

// PATCH — marcar todas como lidas
export async function PATCH(_req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  await (prisma as any).notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
