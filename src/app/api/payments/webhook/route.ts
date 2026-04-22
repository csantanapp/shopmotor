import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mpPayment } from "@/lib/mercadopago";

const PLANS: Record<string, { days: number; boostLevel: "DESTAQUE" | "ELITE" }> = {
  TURBO:         { days: 5,  boostLevel: "DESTAQUE" },
  DESTAQUE:      { days: 7,  boostLevel: "DESTAQUE" },
  SUPER_DESTAQUE:{ days: 15, boostLevel: "ELITE"    },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // MP envia type=payment e data.id com o ID do pagamento
    if (body.type !== "payment") return NextResponse.json({ ok: true });

    const mpId = String(body.data?.id);
    if (!mpId) return NextResponse.json({ ok: true });

    const mpData = await mpPayment.get({ id: mpId });

    if (mpData.status !== "approved") {
      // Atualiza status no banco se tiver referência
      const extRef = mpData.external_reference;
      if (extRef) {
        await (prisma.payment as any).updateMany({
          where: { id: extRef },
          data: { status: mpData.status ?? "pending", mpPaymentId: mpId },
        });
      }
      return NextResponse.json({ ok: true });
    }

    const paymentRecord = await (prisma.payment as any).findUnique({
      where: { id: mpData.external_reference! },
    });
    if (!paymentRecord) return NextResponse.json({ ok: true });

    // Idempotência: já aprovado
    if (paymentRecord.status === "approved") return NextResponse.json({ ok: true });

    const plan = PLANS[paymentRecord.plan];
    if (!plan) return NextResponse.json({ ok: true });

    const boostUntil = new Date(Date.now() + plan.days * 86400000);

    await Promise.all([
      (prisma.payment as any).update({
        where: { id: paymentRecord.id },
        data: { status: "approved", mpPaymentId: mpId },
      }),
      paymentRecord.vehicleId
        ? (prisma.vehicle as any).update({
            where: { id: paymentRecord.vehicleId },
            data: {
              boostLevel:   plan.boostLevel,
              boostPlan:    paymentRecord.plan,
              boostUntil,
              boostTopUntil: boostUntil,
            },
          })
        : Promise.resolve(),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[webhook MP]", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

// MP também usa GET para validar o endpoint
export async function GET() {
  return NextResponse.json({ ok: true });
}
