import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const seller = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, avatarUrl: true, phone: true,
      plan: true, city: true, state: true, createdAt: true,
      _count: {
        select: {
          vehicles: { where: { status: "ACTIVE" } },
        },
      },
    },
  });

  if (!seller) return NextResponse.json({ error: "Vendedor não encontrado." }, { status: 404 });

  const vehicles = await prisma.vehicle.findMany({
    where: { userId: id, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 24,
    include: { photos: { where: { isCover: true }, take: 1 } },
  });

  const totalListings = await prisma.vehicle.count({
    where: { userId: id },
  });

  const reviews = await prisma.review.findMany({
    where: { toUserId: id },
    select: { rating: true },
  });

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
    : null;

  return NextResponse.json({
    seller,
    vehicles,
    stats: {
      activeListings: seller._count.vehicles,
      soldCount: totalListings,
      avgRating,
      reviewCount: reviews.length,
    },
  });
}
