import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Banner = {
  url: string; title?: string; subtitle?: string; link?: string;
  active: boolean; startsAt?: string; endsAt?: string;
};

export async function GET() {
  const row = await prisma.siteConfig.findUnique({ where: { key: "hero_banners" } });
  const all: Banner[] = row ? JSON.parse(row.value) : [];

  const now = new Date();
  const visible = all.filter(b => {
    if (!b.active) return false;
    if (b.startsAt && new Date(b.startsAt) > now) return false;
    if (b.endsAt   && new Date(b.endsAt)   < now) return false;
    return true;
  });

  return NextResponse.json(visible, {
    headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" },
  });
}
