import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getErpUser } from "@/lib/auth";

export async function GET() {
  const user = await getErpUser(req);
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const vehicles = await prisma.vehicle.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      photos: { where: { isCover: true }, take: 1 },
      _count: { select: { conversations: true, favorites: true } },
    },
  });

  return NextResponse.json({ vehicles });
}
