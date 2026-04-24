import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser() as any;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.accountType !== "PJ") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Verifica plano Pro+ ativo
  const now = new Date();
  const db = prisma as any;
  const activeSub = await db.storeSubscription.findFirst({
    where: { userId: user.id, status: "active", endsAt: { gt: now } },
    select: { plan: true },
  });
  if (!activeSub || !["PRO", "ELITE"].includes(activeSub.plan)) {
    return NextResponse.json({ error: "Plano Pro+ necessário" }, { status: 403 });
  }

  const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const storeSlug = user.storeSlug as string | null;

  // Busca veículos ativos do lojista
  const vehicles = await prisma.vehicle.findMany({
    where: { userId: user.id, status: "ACTIVE" },
    select: { id: true, brand: true, model: true, version: true, yearModel: true, views: true },
    orderBy: { views: "desc" },
    take: 10,
  });
  const vehicleIds = vehicles.map((v: any) => v.id);

  // Paths relevantes: página da loja + páginas dos veículos
  const storePath = storeSlug ? `/loja/${storeSlug}` : null;
  const vehiclePaths = vehicleIds.map((id: string) => `/carro/${id}`);
  const waPath = storePath ? `${storePath}/whatsapp` : null;
  const relevantPaths = [...(storePath ? [storePath] : []), ...vehiclePaths];

  if (relevantPaths.length === 0) {
    return NextResponse.json({ total: 0, last30Total: 0, days: [], devices: [], sources: [], topVehicles: [], waClicks: 0, waClicks30d: 0 });
  }

  const pathFilter = { path: { in: relevantPaths } };

  const [total, last30Views, deviceRows, sourceRows, waTotal, waLast30] = await Promise.all([
    db.pageView.count({ where: pathFilter }),
    db.pageView.findMany({
      where: { createdAt: { gte: d30 }, ...pathFilter },
      select: { createdAt: true, sessionId: true, referrer: true, device: true, path: true },
      orderBy: { createdAt: "asc" },
    }),
    db.pageView.groupBy({
      by: ["device"], _count: { id: true },
      where: { createdAt: { gte: d30 }, ...pathFilter },
    }),
    db.pageView.groupBy({
      by: ["referrer"], _count: { id: true },
      where: { createdAt: { gte: d30 }, ...pathFilter },
      orderBy: { _count: { id: "desc" } },
      take: 8,
    }),
    waPath ? db.pageView.count({ where: { path: waPath } }) : Promise.resolve(0),
    waPath ? db.pageView.count({ where: { path: waPath, createdAt: { gte: d30 } } }) : Promise.resolve(0),
  ]);

  // Daily chart
  const dailyMap: Record<string, number> = {};
  const uniqueSessions = new Set<string>();
  for (const v of last30Views) {
    const day = v.createdAt.toISOString().slice(0, 10);
    dailyMap[day] = (dailyMap[day] ?? 0) + 1;
    if (v.sessionId) uniqueSessions.add(v.sessionId);
  }
  const days: { date: string; views: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, views: dailyMap[key] ?? 0 });
  }

  // Devices
  const deviceMap: Record<string, number> = {};
  for (const r of deviceRows) {
    const k = r.device ?? "Desktop";
    deviceMap[k] = (deviceMap[k] ?? 0) + r._count.id;
  }
  const totalDevices = Object.values(deviceMap).reduce((a: number, b: number) => a + b, 0);
  const devices = Object.entries(deviceMap)
    .map(([device, count]) => ({ device, count, pct: totalDevices > 0 ? Math.round((count / totalDevices) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);

  // Sources
  const srcMap: Record<string, number> = {};
  for (const r of sourceRows) {
    const ref = r.referrer;
    let label = "Direto";
    if (ref) {
      try { label = new URL(ref).hostname.replace("www.", ""); } catch { label = ref.slice(0, 30); }
    }
    srcMap[label] = (srcMap[label] ?? 0) + r._count.id;
  }
  const sources = Object.entries(srcMap)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Top veículos com views do pageView (30d)
  const vehicleViewMap: Record<string, number> = {};
  for (const v of last30Views) {
    const match = v.path.match(/^\/carro\/(.+)$/);
    if (match) vehicleViewMap[match[1]] = (vehicleViewMap[match[1]] ?? 0) + 1;
  }
  const topVehicles = vehicles
    .map((v: any) => ({ ...v, views30d: vehicleViewMap[v.id] ?? 0 }))
    .sort((a: any, b: any) => b.views30d - a.views30d)
    .slice(0, 5);

  return NextResponse.json({
    total,
    last30Total: last30Views.length,
    uniqueSessions: uniqueSessions.size,
    days,
    devices,
    sources,
    topVehicles,
    waClicks: waTotal,
    waClicks30d: waLast30,
    plan: activeSub.plan,
  });
}
