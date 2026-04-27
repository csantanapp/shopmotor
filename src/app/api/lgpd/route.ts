import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const doc = searchParams.get("doc"); // "privacidade" | "termos"

  const keys =
    doc === "privacidade"
      ? ["lgpd_privacidade", "lgpd_privacidade_updated"]
      : doc === "termos"
      ? ["lgpd_termos", "lgpd_termos_updated"]
      : ["lgpd_privacidade", "lgpd_privacidade_updated", "lgpd_termos", "lgpd_termos_updated"];

  const rows = await prisma.siteConfig.findMany({ where: { key: { in: keys } } });
  const config = Object.fromEntries(rows.map((r: { key: string; value: string }) => [r.key, r.value]));
  return NextResponse.json(config, { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate" } });
}
