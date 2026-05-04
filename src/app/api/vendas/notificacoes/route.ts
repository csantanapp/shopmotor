import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const DAY = 86_400_000;

  const conversations = await prisma.conversation.findMany({
    where: { sellerId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      vehicle: { select: { id: true, brand: true, model: true } },
      buyer: { select: { name: true, avatarUrl: true } },
    },
  });

  const notifications: {
    id: string;
    type: "lead_novo" | "mensagem" | "lead_frio";
    title: string;
    body: string;
    href: string;
    createdAt: string;
    read: boolean;
  }[] = [];

  for (const conv of conversations) {
    const last = conv.messages[0];
    if (!last) continue;
    if (last.senderId === user.id) continue; // already replied

    const ageMs = now.getTime() - new Date(last.createdAt).getTime();
    const ageMin = Math.floor(ageMs / 60_000);
    const veh = conv.vehicle ? `${conv.vehicle.brand} ${conv.vehicle.model}` : "anúncio";

    const waitLabel = ageMin < 60
      ? `há ${ageMin} min`
      : ageMin < 1440
        ? `há ${Math.floor(ageMin / 60)}h`
        : `há ${Math.floor(ageMin / 1440)}d`;

    if (ageMs < DAY) {
      notifications.push({
        id: `msg-${conv.id}`,
        type: "mensagem",
        title: `${conv.buyer.name} enviou mensagem`,
        body: `${veh} · ${waitLabel}`,
        href: "/vendas/leads",
        createdAt: last.createdAt.toString(),
        read: false,
      });
    } else {
      notifications.push({
        id: `frio-${conv.id}`,
        type: "lead_frio",
        title: `Lead sem resposta`,
        body: `${conv.buyer.name} · ${veh} · ${waitLabel}`,
        href: "/vendas/leads",
        createdAt: last.createdAt.toString(),
        read: false,
      });
    }
  }

  notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({
    notifications: notifications.slice(0, 10),
    unreadCount: notifications.length,
  });
}
