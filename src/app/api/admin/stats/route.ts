import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: Request) {
  const err = await requireAdmin(req);
  if (err) return err;

  const db = prisma as any;

  const [
    totalPF, totalPJ,
    totalVehicles, totalCars, totalMotos,
    recentUsers, recentStores,
    totalNegotiatedValue,
    vehiclesByMonth,
    usersByMonth,
  ] = await Promise.all([
    db.user.count({ where: { accountType: "PF" } }),
    db.user.count({ where: { accountType: "PJ" } }),
    prisma.vehicle.count({ where: { status: "ACTIVE" } }),
    prisma.vehicle.count({ where: { status: "ACTIVE", vehicleType: "CAR" } }),
    prisma.vehicle.count({ where: { status: "ACTIVE", vehicleType: "MOTO" } }),

    db.user.findMany({
      where: { accountType: "PF" },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, name: true, email: true, city: true, state: true, createdAt: true, plan: true, role: true },
    }),
    db.user.findMany({
      where: { accountType: "PJ", storeSlug: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, name: true, tradeName: true, companyName: true, email: true, city: true, state: true, storeSlug: true, createdAt: true, _count: { select: { vehicles: true } } },
    }),

    prisma.vehicle.aggregate({
      where: { status: "ACTIVE" },
      _sum: { price: true },
    }),

    prisma.$queryRaw`
      SELECT DATE_TRUNC('month', "createdAt") AS month, COUNT(*)::int AS count
      FROM vehicles
      WHERE "createdAt" > NOW() - INTERVAL '6 months'
      GROUP BY 1 ORDER BY 1
    `,

    prisma.$queryRaw`
      SELECT DATE_TRUNC('month', "createdAt") AS month, COUNT(*)::int AS count
      FROM users
      WHERE "createdAt" > NOW() - INTERVAL '6 months'
      GROUP BY 1 ORDER BY 1
    `,
  ]);

  return NextResponse.json({
    users: { pf: totalPF, pj: totalPJ, total: totalPF + totalPJ },
    vehicles: { total: totalVehicles, cars: totalCars, motos: totalMotos },
    negotiatedValue: totalNegotiatedValue._sum.price ?? 0,
    recentUsers,
    recentStores,
    vehiclesByMonth,
    usersByMonth,
  });
}
