import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mpPayment } from "@/lib/mercadopago";
import { createHmac } from "crypto";

const PLANS: Record<string, { days: number; boostLevel: "DESTAQUE" | "ELITE" }> = {
  TURBO:         { days: 7,  boostLevel: "DESTAQUE" },
  DESTAQUE:      { days: 15, boostLevel: "DESTAQUE" },
  SUPER_DESTAQUE:{ days: 30, boostLevel: "ELITE"    },
};

// Valida assinatura HMAC-SHA256 enviada pelo Mercado Pago
// Docs: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
function validateSignature(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    // Em desenvolvimento sem secret configurado, pula validação
    console.warn("[webhook MP] MP_WEBHOOK_SECRET não configurado — validação de assinatura pulada");
    return true;
  }

  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  const url = new URL(req.url);
  const dataId = url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "";

  if (!xSignature) return false;

  // Monta o manifesto: ts=...&v1=...
  const parts = Object.fromEntries(xSignature.split(",").map(p => p.trim().split("=")));
  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  // Template: id:[data.id];request-id:[x-request-id];ts:[ts];
  const manifest = `id:${dataId};request-id:${xRequestId ?? ""};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  return expected === v1;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    if (!validateSignature(req, rawBody)) {
      console.warn("[webhook MP] Assinatura inválida — requisição rejeitada");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    // MP envia type=payment e data.id com o ID do pagamento
    if (body.type !== "payment") return NextResponse.json({ ok: true });

    const mpId = String(body.data?.id);
    if (!mpId) return NextResponse.json({ ok: true });

    // Busca dados reais do pagamento diretamente na API do MP (segunda camada de segurança)
    const mpData = await mpPayment.get({ id: mpId });

    if (mpData.status !== "approved") {
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
              boostLevel:    plan.boostLevel,
              boostPlan:     paymentRecord.plan,
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

// MP usa GET para validar o endpoint na configuração
export async function GET() {
  return NextResponse.json({ ok: true });
}
