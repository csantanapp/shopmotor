import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600; // cache por 1h

export async function GET() {
  const db = prisma;
  const [totalVehicles, totalUsers, totalStores] = await Promise.all([
    prisma.vehicle.count({ where: { status: "ACTIVE" } }),
    db.user.count(),
    db.user.count({ where: { accountType: "PJ", storeSlug: { not: null } } }),
  ]);

  return NextResponse.json({ totalVehicles, totalUsers, totalStores });
}
