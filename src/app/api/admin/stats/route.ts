import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: Request) {
  const err = await requireAdmin(req);
  if (err) return err;

  const db = prisma;

  const [
    totalPF, totalPJ,
    totalVehicles, totalCars, totalMotos,
    recentUsers, recentStores,
    totalVehicleValue,
    vehiclesByMonth,
    usersByMonth,
    revenueApproved,
    revenueByPlan,
    revenueByMonth,
    recentPayments,
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

    // Soma do valor de todos os veículos ativos
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

    // Receita total aprovada de impulsionamentos
    prisma.payment.aggregate({
      where: { status: "approved" },
      _sum: { amount: true },
      _count: true,
    }),

    // Receita por plano de impulsionamento
    prisma.$queryRaw`
      SELECT plan, status, SUM(amount)::float AS total, COUNT(*)::int AS count
      FROM payments
      GROUP BY plan, status
      ORDER BY total DESC
    `,

    // Receita aprovada por mês (últimos 6 meses)
    prisma.$queryRaw`
      SELECT DATE_TRUNC('month', "createdAt") AS month, SUM(amount)::float AS total, COUNT(*)::int AS count
      FROM payments
      WHERE status = 'approved' AND "createdAt" > NOW() - INTERVAL '6 months'
      GROUP BY 1 ORDER BY 1
    `,

    // Últimos pagamentos
    db.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        user: { select: { name: true, email: true } },
        vehicle: { select: { brand: true, model: true } },
      },
    }),
  ]);

  return NextResponse.json({
    users: { pf: totalPF, pj: totalPJ, total: totalPF + totalPJ },
    vehicles: { total: totalVehicles, cars: totalCars, motos: totalMotos },
    totalVehicleValue: totalVehicleValue._sum.price ?? 0,
    recentUsers,
    recentStores,
    vehiclesByMonth,
    usersByMonth,
    revenue: {
      total: revenueApproved._sum.amount ?? 0,
      count: revenueApproved._count,
      byPlan: revenueByPlan,
      byMonth: revenueByMonth,
      recent: recentPayments,
    },
  });
}
