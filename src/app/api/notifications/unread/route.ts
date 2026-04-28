import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ count: 0 }, { status: 401 });

  const [messages, notifications] = await Promise.all([
    prisma.message.count({
      where: {
        readAt: null,
        senderId: { not: user.id },
        conversation: {
          OR: [{ buyerId: user.id }, { sellerId: user.id }],
        },
      },
    }),
    (prisma as any).notification.count({
      where: { userId: user.id, readAt: null },
    }),
  ]);

  return NextResponse.json({ count: messages + notifications, messages, notifications });
}
