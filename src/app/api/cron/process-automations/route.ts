import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { sendCmsEmail } from "@/lib/cms-email";

// Roda diariamente — processa automações ativas
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = prisma as any;
  const now = new Date();
  const automations = await db.cmsAutomation.findMany({ where: { active: true } });

  let processed = 0;

  for (const auto of automations) {
    const channels: string[] = JSON.parse(auto.channels ?? '["in_app"]');

    // Determinar quais usuários disparam esse trigger
    const where: any = { isDemo: false };
    if (auto.segment === "pf")      where.accountType = "PF";
    if (auto.segment === "lojista") where.accountType = "PJ";

    if (auto.trigger === "plan_expiring_7d") {
      const in7days = new Date(now);
      in7days.setDate(in7days.getDate() + 7);
      const in8days = new Date(now);
      in8days.setDate(in8days.getDate() + 8);
      // Usuários com assinatura ativa vencendo nos próximos 7 dias
      const subs = await db.storeSubscription.findMany({
        where: { status: "active", expiresAt: { gte: now, lt: in8days } },
        select: { userId: true },
      });
      where.id = { in: subs.map((s: any) => s.userId) };
    }

    if (auto.trigger === "plan_expired") {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const subs = await db.storeSubscription.findMany({
        where: { status: "expired", expiresAt: { gte: yesterday, lt: now } },
        select: { userId: true },
      });
      where.id = { in: subs.map((s: any) => s.userId) };
    }

    if (auto.trigger === "new_user") {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      where.createdAt = { gte: yesterday, lt: now };
    }

    const users: any[] = await db.user.findMany({
      where,
      select: { id: true, email: true, name: true, emailUnsubscribed: true },
    });

    for (const user of users) {
      if (channels.includes("in_app")) {
        await createNotification({
          userId: user.id, type: auto.type,
          title: auto.title,
          body: auto.body.replace(/<[^>]*>/g, "").slice(0, 200),
          actionUrl: auto.ctaUrl ?? undefined,
        });
      }
      if (channels.includes("email") && user.email && !user.emailUnsubscribed) {
        await sendCmsEmail({
          to: user.email, name: user.name, userId: user.id,
          title: auto.title, body: auto.body,
          ctaLabel: auto.ctaLabel, ctaUrl: auto.ctaUrl,
        });
      }
    }

    await db.cmsAutomation.update({
      where: { id: auto.id },
      data: { lastRunAt: now },
    });

    processed++;
  }

  return NextResponse.json({ processed });
}
