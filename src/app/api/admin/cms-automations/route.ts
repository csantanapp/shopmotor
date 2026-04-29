import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;
  const db = prisma as any;
  const automations = await db.cmsAutomation.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(automations);
}

export async function POST(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;
  const body = await req.json();
  const db = prisma as any;
  const a = await db.cmsAutomation.create({
    data: {
      name:     body.name     ?? "Nova automação",
      trigger:  body.trigger  ?? "plan_expiring_7d",
      title:    body.title    ?? "",
      body:     body.body     ?? "",
      type:     body.type     ?? "notice",
      segment:  body.segment  ?? "all",
      channels: JSON.stringify(body.channels ?? ["in_app"]),
      ctaLabel: body.ctaLabel || null,
      ctaUrl:   body.ctaUrl   || null,
      active:   body.active   ?? true,
    },
  });
  return NextResponse.json(a, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;
  const body = await req.json();
  const db = prisma as any;
  const data: any = {};
  if (body.name     !== undefined) data.name     = body.name;
  if (body.trigger  !== undefined) data.trigger  = body.trigger;
  if (body.title    !== undefined) data.title    = body.title;
  if (body.body     !== undefined) data.body     = body.body;
  if (body.type     !== undefined) data.type     = body.type;
  if (body.segment  !== undefined) data.segment  = body.segment;
  if (body.channels !== undefined) data.channels = JSON.stringify(body.channels);
  if (body.ctaLabel !== undefined) data.ctaLabel = body.ctaLabel || null;
  if (body.ctaUrl   !== undefined) data.ctaUrl   = body.ctaUrl   || null;
  if (body.active   !== undefined) data.active   = body.active;
  const a = await db.cmsAutomation.update({ where: { id: body.id }, data });
  return NextResponse.json(a);
}

export async function DELETE(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;
  const { id } = await req.json();
  const db = prisma as any;
  await db.cmsAutomation.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
