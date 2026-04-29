import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { createNotification } from "@/lib/notifications";
import { sendCmsEmail } from "@/lib/cms-email";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const err = await requireAdmin(req);
  if (err) return err;
  const { id } = await params;
  const db = prisma as any;
  const msg = await db.cmsMessage.findUnique({ where: { id } });
  if (!msg) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  return NextResponse.json(msg);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const err = await requireAdmin(req);
  if (err) return err;
  const { id } = await params;
  const body = await req.json();
  const db = prisma as any;

  const data: any = {};
  if (body.title       !== undefined) data.title       = body.title;
  if (body.body        !== undefined) data.body        = body.body;
  if (body.type        !== undefined) data.type        = body.type;
  if (body.status      !== undefined) data.status      = body.status;
  if (body.segment     !== undefined) data.segment     = body.segment;
  if (body.channels    !== undefined) data.channels    = JSON.stringify(body.channels);
  if (body.ctaLabel    !== undefined) data.ctaLabel    = body.ctaLabel || null;
  if (body.ctaUrl      !== undefined) data.ctaUrl      = body.ctaUrl   || null;
  if (body.tags        !== undefined) data.tags        = body.tags ? JSON.stringify(body.tags) : null;
  if (body.scheduledAt !== undefined) data.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;

  const msg = await db.cmsMessage.update({ where: { id }, data });
  return NextResponse.json(msg);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const err = await requireAdmin(req);
  if (err) return err;
  const { id } = await params;
  const db = prisma as any;
  const msg = await db.cmsMessage.findUnique({ where: { id }, select: { status: true } });
  if (!msg) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  if (msg.status === "sent") {
    // Mensagens enviadas: apenas arquivar
    await db.cmsMessage.update({ where: { id }, data: { status: "archived" } });
    return NextResponse.json({ archived: true });
  }
  await db.cmsMessage.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}

// POST /api/admin/cms-messages/[id]/send — enviar agora
export async function PATCH(req: NextRequest, { params }: Params) {
  const err = await requireAdmin(req);
  if (err) return err;
  const { id } = await params;
  const db = prisma as any;

  const msg = await db.cmsMessage.findUnique({ where: { id } });
  if (!msg) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  if (msg.status === "sent") return NextResponse.json({ error: "Já enviada." }, { status: 400 });

  const channels: string[] = JSON.parse(msg.channels ?? '["in_app"]');

  // Buscar destinatários
  const where: any = {};
  if (msg.segment === "pf")      where.accountType = "PF";
  if (msg.segment === "lojista") where.accountType = "PJ";
  where.isDemo = false;

  const users: any[] = await (prisma as any).user.findMany({ where, select: { id: true, email: true, name: true, emailUnsubscribed: true } });

  let sent = 0;

  for (const user of users) {
    // In-app
    if (channels.includes("in_app")) {
      await createNotification({
        userId:    user.id,
        type:      msg.type,
        title:     msg.title,
        body:      msg.body.replace(/<[^>]*>/g, "").slice(0, 200),
        actionUrl: msg.ctaUrl ?? undefined,
      });
    }
    // Email
    if (channels.includes("email") && user.email && !(user as any).emailUnsubscribed) {
      await sendCmsEmail({
        to: user.email, name: user.name, userId: user.id as string,
        title: msg.title, body: msg.body,
        ctaLabel: msg.ctaLabel, ctaUrl: msg.ctaUrl,
      });
    }
    sent++;
  }

  await db.cmsMessage.update({
    where: { id },
    data: { status: "sent", sentAt: new Date(), totalSent: sent },
  });

  return NextResponse.json({ ok: true, totalSent: sent });
}
