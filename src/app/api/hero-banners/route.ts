import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const row = await prisma.siteConfig.findUnique({ where: { key: "hero_banners" } });
  const banners = row ? JSON.parse(row.value) : [];
  return NextResponse.json(banners, { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } });
}
