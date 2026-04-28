import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { mpPreference } from "@/lib/mercadopago";

const PLANS: Record<string, { name: string; price: number; days: number; boostLevel: "DESTAQUE" | "ELITE" }> = {
  TURBO:         { name: "Turbo",         price: 17.90, days: 7,  boostLevel: "DESTAQUE" },
  DESTAQUE:      { name: "Destaque",      price: 27.90, days: 15, boostLevel: "DESTAQUE" },
  SUPER_DESTAQUE:{ name: "Super Destaque",price: 47.90, days: 30, boostLevel: "ELITE"    },
};

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { vehicleId, plan: planKey } = await req.json();

  const plan = PLANS[planKey];
  if (!plan) return NextResponse.json({ error: "Plano inválido." }, { status: 400 });

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { id: true, brand: true, model: true, userId: true },
  });
  if (!vehicle || vehicle.userId !== user.id)
    return NextResponse.json({ error: "Veículo não encontrado." }, { status: 404 });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      vehicleId: vehicle.id,
      plan: planKey,
      amount: plan.price,
      status: "pending",
    },
  });

  const preference = await mpPreference.create({
    body: {
      items: [{
        id: planKey,
        title: `ShopMotor — Plano ${plan.name}`,
        description: `Impulsionamento ${plan.name} por ${plan.days} dias para ${vehicle.brand} ${vehicle.model}`,
        quantity: 1,
        unit_price: plan.price,
        currency_id: "BRL",
      }],
      external_reference: payment.id,
      back_urls: {
        success: `${baseUrl}/perfil/meus-anuncios?boost=success`,
        failure: `${baseUrl}/perfil/impulsionar/${vehicleId}?boost=failed`,
        pending: `${baseUrl}/perfil/meus-anuncios?boost=pending`,
      },
      ...(baseUrl.startsWith("https") && { auto_return: "approved" }),
      notification_url: `${baseUrl}/api/payments/webhook`,
      metadata: { paymentId: payment.id, vehicleId, planKey },
    },
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { mpPreferenceId: preference.id },
  });

  return NextResponse.json({ initPoint: preference.init_point, preferenceId: preference.id });
}
