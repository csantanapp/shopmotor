import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mpPayment } from "@/lib/mercadopago";
import { STORE_PLANS, StorePlan } from "@/lib/store-plans";
import { createHmac } from "crypto";

function validateSignature(req: NextRequest): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") return false;
    return true;
  }
  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  const dataId = new URL(req.url).searchParams.get("data.id") ?? "";
  if (!xSignature) return false;
  const parts = Object.fromEntries(xSignature.split(",").map(p => p.trim().split("=")));
  const { ts, v1 } = parts;
  if (!ts || !v1) return false;
  const manifest = `id:${dataId};request-id:${xRequestId ?? ""};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  return expected === v1;
}

export async function POST(req: NextRequest) {
  if (!validateSignature(req)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const paymentId = body?.data?.id ?? body?.id;
    if (!paymentId) return NextResponse.json({ ok: true });

    const payment = await mpPayment.get({ id: paymentId });
    if (payment.status !== "approved") return NextResponse.json({ ok: true });

    const subId = payment.external_reference;
    if (!subId) return NextResponse.json({ ok: true });

    const db = prisma as any;
    const sub = await db.storeSubscription.findUnique({ where: { id: subId } });
    if (!sub) return NextResponse.json({ ok: true });

    const plan = STORE_PLANS[sub.plan as StorePlan];
    if (!plan) return NextResponse.json({ ok: true });

    const now = new Date();
    const endsAt = new Date(now.getTime() + plan.days * 24 * 60 * 60 * 1000);

    await db.storeSubscription.update({
      where: { id: subId },
      data: {
        status: "active",
        mpPaymentId: String(paymentId),
        startsAt: now,
        endsAt,
      },
    });
  } catch (e) {
    console.error("[subscription-webhook]", e);
  }

  return NextResponse.json({ ok: true });
}
