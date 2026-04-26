import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

const KEYS = ["lgpd_privacidade", "lgpd_termos", "lgpd_privacidade_updated", "lgpd_termos_updated"];

export async function GET(req: Request) {
  const err = await requireAdmin(req);
  if (err) return err;

  const rows = await (prisma.siteConfig as any).findMany({ where: { key: { in: KEYS } } });
  const config = Object.fromEntries(rows.map((r: { key: string; value: string }) => [r.key, r.value]));
  return NextResponse.json(config);
}

export async function PUT(req: Request) {
  const err = await requireAdmin(req);
  if (err) return err;

  const body = await req.json();

  await Promise.all(
    KEYS.filter(k => body[k] !== undefined).map(k =>
      (prisma.siteConfig as any).upsert({
        where:  { key: k },
        create: { key: k, value: String(body[k]) },
        update: { value: String(body[k]) },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
