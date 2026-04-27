import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { mpPreference } from "@/lib/mercadopago";
import { STORE_PLANS, StorePlan } from "@/lib/store-plans";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  if ((user as any).accountType !== "PJ")
    return NextResponse.json({ error: "Apenas lojistas podem assinar planos." }, { status: 403 });

  const { plan: planKey } = await req.json();
  const plan = STORE_PLANS[planKey as StorePlan];
  if (!plan) return NextResponse.json({ error: "Plano inválido." }, { status: 400 });

  const db = prisma;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const sub = await db.storeSubscription.create({
    data: { userId: user.id, plan: planKey, amount: plan.price, status: "pending" },
  });

  const preference = await mpPreference.create({
    body: {
      items: [{
        id: `sub_${planKey}`,
        title: `ShopMotor Loja — Plano ${plan.name}`,
        description: `Assinatura mensal Plano ${plan.name} — ${plan.days} dias`,
        quantity: 1,
        unit_price: plan.price,
        currency_id: "BRL",
      }],
      external_reference: sub.id,
      back_urls: {
        success: `${baseUrl}/perfil/plano?sub=success`,
        failure: `${baseUrl}/perfil/plano?sub=failed`,
        pending: `${baseUrl}/perfil/plano?sub=pending`,
      },
      ...(baseUrl.startsWith("https") && { auto_return: "approved" }),
      notification_url: `${baseUrl}/api/payments/subscription-webhook`,
      metadata: { subscriptionId: sub.id, planKey },
    },
  });

  await db.storeSubscription.update({
    where: { id: sub.id },
    data: { mpPreferenceId: preference.id },
  });

  return NextResponse.json({ initPoint: preference.init_point });
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const db = prisma;
  const now = new Date();

  const active = await db.storeSubscription.findFirst({
    where: { userId: user.id, status: "active", endsAt: { gt: now } },
    orderBy: { endsAt: "desc" },
  });

  return NextResponse.json({ subscription: active });
}
