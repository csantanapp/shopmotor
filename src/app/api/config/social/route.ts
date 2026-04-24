import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SOCIAL_KEYS = ["social_facebook", "social_instagram", "social_youtube", "social_tiktok"];

export const revalidate = 3600;

export async function GET() {
  const rows = await (prisma.siteConfig as any).findMany({ where: { key: { in: SOCIAL_KEYS } } });
  const config = Object.fromEntries(rows.map((r: { key: string; value: string }) => [r.key, r.value]));
  return NextResponse.json(config);
}
