import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const db = prisma as any;
  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const notAdmin = { NOT: { path: { startsWith: "/admin" } } };

  const [total, last30Views, deviceRows, sourceRows, pageRows, cityRows] = await Promise.all([
    db.pageView.count({ where: notAdmin }),
    db.pageView.findMany({
      where: { createdAt: { gte: d30 }, ...notAdmin },
      select: { createdAt: true, sessionId: true },
      orderBy: { createdAt: "asc" },
    }),
    db.pageView.groupBy({ by: ["device"], _count: { id: true }, where: { createdAt: { gte: d30 }, ...notAdmin } }),
    db.pageView.groupBy({ by: ["referrer"], _count: { id: true }, where: { createdAt: { gte: d30 }, ...notAdmin }, orderBy: { _count: { id: "desc" } }, take: 10 }),
    db.pageView.groupBy({ by: ["path"], _count: { id: true }, where: { createdAt: { gte: d30 }, ...notAdmin }, orderBy: { _count: { id: "desc" } }, take: 10 }),
    db.pageView.findMany({ where: { createdAt: { gte: d30 }, country: { not: null }, ...notAdmin }, select: { country: true, region: true, city: true }, take: 500 }),
  ]);

  // Build daily chart (last 30 days)
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

  // Traffic sources
  const sources = sourceRows.map((r: any) => {
    const ref = r.referrer;
    let label = "Direto";
    if (ref) {
      try { label = new URL(ref).hostname.replace("www.", ""); } catch { label = ref.slice(0, 30); }
    }
    return { source: label, count: r._count.id };
  });

  // Merge "Direto" (null referrer) rows
  const directCount = sources.filter((s: any) => s.source === "Direto").reduce((a: number, b: any) => a + b.count, 0);
  const otherSources = sources.filter((s: any) => s.source !== "Direto");
  const mergedSources = directCount > 0 ? [{ source: "Direto", count: directCount }, ...otherSources] : otherSources;

  return NextResponse.json({
    total,
    last30Total: last30Views.length,
    uniqueSessions: uniqueSessions.size,
    days,
    devices: deviceRows.map((r: any) => ({ device: r.device ?? "unknown", count: r._count.id })),
    sources: mergedSources,
    pages: pageRows.map((r: any) => ({ path: r.path, count: r._count.id })),
    cities: (() => {
      const map: Record<string, { country: string; region: string | null; city: string | null; count: number }> = {};
      for (const r of cityRows) {
        const key = `${r.country}|${r.region ?? ""}|${r.city ?? ""}`;
        if (map[key]) map[key].count++;
        else map[key] = { country: r.country, region: r.region ?? null, city: r.city ?? null, count: 1 };
      }
      return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 15);
    })(),
  });
}
