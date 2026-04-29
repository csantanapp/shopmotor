import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { sendCmsEmail } from "@/lib/cms-email";

// Roda a cada minuto — envia mensagens agendadas cujo horário já passou
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = prisma as any;
  const now = new Date();

  const messages = await db.cmsMessage.findMany({
    where: { status: "scheduled", scheduledAt: { lte: now } },
  });

  if (messages.length === 0) return NextResponse.json({ sent: 0 });

  let totalProcessed = 0;

  for (const msg of messages) {
    const channels: string[] = JSON.parse(msg.channels ?? '["in_app"]');

    const where: any = { isDemo: false };
    if (msg.segment === "pf")      where.accountType = "PF";
    if (msg.segment === "lojista") where.accountType = "PJ";

    const users: any[] = await (prisma as any).user.findMany({ where, select: { id: true, email: true, name: true, emailUnsubscribed: true } });

    for (const user of users) {
      if (channels.includes("in_app")) {
        await createNotification({
          userId:    user.id,
          type:      msg.type,
          title:     msg.title,
          body:      msg.body.replace(/<[^>]*>/g, "").slice(0, 200),
          actionUrl: msg.ctaUrl ?? undefined,
        });
      }
      if (channels.includes("email") && user.email && !(user as any).emailUnsubscribed) {
        await sendCmsEmail({
          to: user.email, name: user.name, userId: user.id,
          title: msg.title, body: msg.body,
          ctaLabel: msg.ctaLabel, ctaUrl: msg.ctaUrl,
        });
      }
    }

    await db.cmsMessage.update({
      where: { id: msg.id },
      data: { status: "sent", sentAt: now, totalSent: users.length },
    });

    totalProcessed++;
  }

  return NextResponse.json({ sent: totalProcessed });
}
