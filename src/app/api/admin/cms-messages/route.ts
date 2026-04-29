import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const { searchParams } = req.nextUrl;
  const status  = searchParams.get("status")  ?? undefined;
  const type    = searchParams.get("type")    ?? undefined;
  const segment = searchParams.get("segment") ?? undefined;
  const q       = searchParams.get("q")       ?? undefined;
  const page    = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit   = 20;
  const skip    = (page - 1) * limit;

  const db = prisma as any;
  const where: any = {};
  if (status)  where.status  = status;
  if (type)    where.type    = type;
  if (segment) where.segment = segment;
  if (q) where.OR = [
    { title: { contains: q, mode: "insensitive" } },
    { body:  { contains: q, mode: "insensitive" } },
  ];

  const [messages, total] = await Promise.all([
    db.cmsMessage.findMany({ where, orderBy: { updatedAt: "desc" }, skip, take: limit }),
    db.cmsMessage.count({ where }),
  ]);

  return NextResponse.json({ messages, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const body = await req.json();
  const db = prisma as any;
  const message = await db.cmsMessage.create({
    data: {
      title:       body.title ?? "Sem título",
      body:        body.body  ?? "",
      type:        body.type  ?? "notice",
      status:      body.status ?? "draft",
      segment:     body.segment ?? "all",
      channels:    JSON.stringify(body.channels ?? ["in_app"]),
      ctaLabel:    body.ctaLabel  || null,
      ctaUrl:      body.ctaUrl    || null,
      tags:        body.tags ? JSON.stringify(body.tags) : null,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      createdBy:   body.createdBy ?? null,
    },
  });
  return NextResponse.json(message, { status: 201 });
}
