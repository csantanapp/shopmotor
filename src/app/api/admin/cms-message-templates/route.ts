import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;
  const db = prisma as any;
  const templates = await db.cmsMessageTemplate.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;
  const body = await req.json();
  const db = prisma as any;
  const t = await db.cmsMessageTemplate.create({
    data: {
      name:     body.name     ?? "Novo template",
      type:     body.type     ?? "notice",
      title:    body.title    ?? "",
      body:     body.body     ?? "",
      ctaLabel: body.ctaLabel || null,
      ctaUrl:   body.ctaUrl   || null,
    },
  });
  return NextResponse.json(t, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;
  const { id } = await req.json();
  const db = prisma as any;
  await db.cmsMessageTemplate.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
