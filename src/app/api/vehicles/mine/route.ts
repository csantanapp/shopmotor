import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const vehicles = await prisma.vehicle.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      photos: { where: { isCover: true }, take: 1 },
      _count: { select: { conversations: true } },
    },
  });

  return NextResponse.json({ vehicles });
}
