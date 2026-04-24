import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const store = await (prisma.user as any).findFirst({
    where: { storeSlug: slug, accountType: "PJ" },
    select: {
      id: true, name: true, tradeName: true, companyName: true,
      avatarUrl: true, storeBannerUrl: true, storeDescription: true,
      city: true, state: true, phone: true, sharePhone: true,
      plan: true, createdAt: true, storeSlug: true,
      _count: { select: { vehicles: { where: { status: "ACTIVE" } } } },
    },
  });

  if (!store) return NextResponse.json({ error: "Loja nao encontrada." }, { status: 404 });

  const vehicles = await prisma.vehicle.findMany({
    where: { userId: store.id, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    include: { photos: { where: { isCover: true }, take: 1 } },
  });

  return NextResponse.json({ store, vehicles });
}
