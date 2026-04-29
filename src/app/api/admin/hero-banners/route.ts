import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;
  const row = await prisma.siteConfig.findUnique({ where: { key: "hero_banners" } });
  const banners = row ? JSON.parse(row.value) : [];
  return NextResponse.json(banners);
}

export async function POST(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;
  const banners = await req.json();
  await prisma.siteConfig.upsert({
    where: { key: "hero_banners" },
    create: { key: "hero_banners", value: JSON.stringify(banners) },
    update: { value: JSON.stringify(banners) },
  });
  return NextResponse.json({ ok: true });
}
