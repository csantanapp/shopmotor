import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ count: 0 }, { status: 401 });

  const count = await prisma.message.count({
    where: {
      readAt: null,
      senderId: { not: user.id },
      conversation: {
        OR: [{ buyerId: user.id }, { sellerId: user.id }],
      },
    },
  });

  return NextResponse.json({ count });
}
